package com.app.bideo.service.payment;

import com.app.bideo.domain.member.MemberVO;
import com.app.bideo.dto.payment.BootpayBillingCardResultDTO;
import com.app.bideo.dto.payment.BootpayPaymentResultDTO;
import com.app.bideo.dto.payment.CardRegisterRequestDTO;
import com.app.bideo.repository.member.MemberRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BootpayBillingService {

    private final MemberRepository memberRepository;
    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.create();

    @Value("${boot-pay.enabled:true}")
    private boolean enabled;

    @Value("${boot-pay.api.application-id:}")
    private String applicationId;

    @Value("${boot-pay.api.private-key:}")
    private String privateKey;

    @Value("${boot-pay.mode:test}")
    private String mode;

    @Value("${boot-pay.billing.pg:nicepay}")
    private String billingPg;

    @Value("${boot-pay.billing.customer.key-prefix:BIDEO_MEMBER_}")
    private String customerKeyPrefix;

    @Value("${boot-pay.urls.server-base-url:https://api.bootpay.co.kr}")
    private String serverBaseUrl;

    // 민감 카드정보는 저장하지 않고, 부트페이 빌링키로 즉시 치환한다.
    public BootpayBillingCardResultDTO issueBillingKey(Long memberId, CardRegisterRequestDTO requestDTO) {
        ensureConfigured();

        MemberVO member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("pg", billingPg);
        requestBody.put("order_name", "BIDEO 카드 등록");
        requestBody.put("subscription_id", buildSubscriptionId(memberId));
        requestBody.put("card_no", requestDTO.getCardNumber());
        requestBody.put("card_pw", requestDTO.getCardPasswordTwoDigits());
        requestBody.put("card_identity_no", requestDTO.getCardIdentityNo());
        requestBody.put("card_expire_year", requestDTO.getCardExpireYear());
        requestBody.put("card_expire_month", requestDTO.getCardExpireMonth());

        Map<String, Object> user = new HashMap<>();
        user.put("username", member.getNickname());
        if (member.getPhoneNumber() != null && !member.getPhoneNumber().isBlank()) {
            user.put("phone", member.getPhoneNumber());
        }
        if (member.getEmail() != null && !member.getEmail().isBlank()) {
            user.put("email", member.getEmail());
        }
        requestBody.put("user", user);

        if ("test".equalsIgnoreCase(mode)) {
            requestBody.put("extra", Map.of("subscribe_test_payment", 1));
        }

        Map<String, Object> response = post("/v2/subscribe/billing_key", requestBody);
        String receiptId = asText(response.get("receipt_id"));
        if (receiptId == null || receiptId.isBlank()) {
            throw new IllegalStateException("부트페이 빌링키 발급 응답에 receipt_id가 없습니다.");
        }

        return lookupBillingKey(receiptId);
    }

    public BootpayPaymentResultDTO requestCardPayment(String billingKey, String orderId, String orderName, long price) {
        ensureConfigured();

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("billing_key", billingKey);
        requestBody.put("order_id", orderId);
        requestBody.put("order_name", orderName);
        requestBody.put("price", price);
        requestBody.put("tax_free", 0);

        Map<String, Object> response = post("/v2/subscribe/payment", requestBody);
        String receiptId = asText(response.get("receipt_id"));
        if (receiptId == null || receiptId.isBlank()) {
            throw new IllegalStateException("부트페이 결제 응답에 receipt_id가 없습니다.");
        }

        Map<String, Object> verified = get("/v2/receipt/" + receiptId);
        String status = asText(verified.get("status"));
        if (!"1".equals(status)) {
            throw new IllegalStateException("부트페이 결제가 완료되지 않았습니다. status=" + status);
        }

        return BootpayPaymentResultDTO.builder()
                .receiptId(receiptId)
                .method(asText(verified.get("method")))
                .status(status)
                .build();
    }

    public BootpayBillingCardResultDTO lookupBillingKey(String receiptId) {
        Map<String, Object> response = get("/v2/subscribe/billing_key/" + receiptId);
        Map<String, Object> billingData = asMap(response.get("billing_data"));

        String billingKey = asText(response.get("billing_key"));
        if (billingKey == null || billingKey.isBlank()) {
            throw new IllegalStateException("부트페이 빌링키 조회 결과에 billing_key가 없습니다.");
        }

        return BootpayBillingCardResultDTO.builder()
                .billingKey(billingKey)
                .billingReceiptId(asText(response.get("receipt_id")))
                .cardCompany(asText(billingData.get("card_company")))
                .cardNumberMasked(asText(billingData.get("card_no")))
                .billingMethod(asText(response.get("method")))
                .billingStatus(asText(response.get("status")))
                .build();
    }

    private void ensureConfigured() {
        if (!enabled || applicationId == null || applicationId.isBlank() || privateKey == null || privateKey.isBlank()) {
            throw new IllegalStateException("부트페이 설정이 비어 있어 카드 등록 또는 간편결제를 진행할 수 없습니다.");
        }
    }

    private String buildSubscriptionId(Long memberId) {
        return customerKeyPrefix + memberId + "_" + UUID.randomUUID().toString().replace("-", "");
    }

    private Map<String, Object> post(String path, Map<String, Object> body) {
        try {
            String responseBody = restClient.post()
                    .uri(serverBaseUrl + path)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + getAccessToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);
            return objectMapper.readValue(responseBody, new TypeReference<>() {});
        } catch (Exception e) {
            throw new IllegalStateException("부트페이 서버 호출에 실패했습니다.", e);
        }
    }

    private Map<String, Object> get(String path) {
        try {
            String responseBody = restClient.get()
                    .uri(serverBaseUrl + path)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + getAccessToken())
                    .retrieve()
                    .body(String.class);
            return objectMapper.readValue(responseBody, new TypeReference<>() {});
        } catch (Exception e) {
            throw new IllegalStateException("부트페이 조회 호출에 실패했습니다.", e);
        }
    }

    private String getAccessToken() {
        try {
            String basicToken = Base64.getEncoder()
                    .encodeToString((applicationId + ":" + privateKey).getBytes(StandardCharsets.UTF_8));
            String responseBody = restClient.post()
                    .uri(serverBaseUrl + "/v2/request/token")
                    .header(HttpHeaders.AUTHORIZATION, "Basic " + basicToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "application_id", applicationId,
                            "private_key", privateKey
                    ))
                    .retrieve()
                    .body(String.class);
            Map<String, Object> response = objectMapper.readValue(responseBody, new TypeReference<>() {});
            String accessToken = asText(response.get("access_token"));
            if (accessToken == null || accessToken.isBlank()) {
                throw new IllegalStateException("부트페이 access_token 발급에 실패했습니다.");
            }
            return accessToken;
        } catch (Exception e) {
            throw new IllegalStateException("부트페이 access_token 발급에 실패했습니다.", e);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object value) {
        if (value instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return Map.of();
    }

    private String asText(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
