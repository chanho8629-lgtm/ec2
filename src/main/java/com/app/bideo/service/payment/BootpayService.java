package com.app.bideo.service.payment;

import com.app.bideo.domain.member.MemberVO;
import com.app.bideo.dto.payment.BootpayBillingCardResultDTO;
import com.app.bideo.dto.payment.BootpayPaymentResultDTO;
import com.app.bideo.dto.payment.CardRegisterRequestDTO;
import com.app.bideo.repository.member.MemberRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class BootpayService {

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

        log.info("Bootpay billing key request pg={}, mode={}, memberId={}, company={}", billingPg, mode, memberId, requestDTO.getCardCompany());

        Map<String, Object> response = post("/v2/request/subscribe", requestBody);
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

    // 카드 등록/결제에 필요한 부트페이 키 설정을 검증한다.
    private void ensureConfigured() {
        if (!enabled || applicationId == null || applicationId.isBlank() || privateKey == null || privateKey.isBlank()) {
            throw new IllegalStateException("부트페이 설정이 비어 있어 카드 등록 또는 간편결제를 진행할 수 없습니다.");
        }
    }

    // 부트페이 정기결제 등록용 고객 키를 생성한다.
    private String buildSubscriptionId(Long memberId) {
        String randomToken = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        return customerKeyPrefix + memberId + "_" + randomToken;
    }

    // 부트페이 POST API를 공통 포맷으로 호출한다.
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
        } catch (RestClientResponseException e) {
            log.error("Bootpay POST failed path={}, status={}, body={}", path, e.getStatusCode().value(), e.getResponseBodyAsString(), e);
            throw new IllegalArgumentException(resolveUserFriendlyMessage(e.getResponseBodyAsString(), "카드 등록 처리에 실패했습니다. 입력한 카드 정보를 다시 확인해 주세요."), e);
        } catch (Exception e) {
            log.error("Bootpay POST failed path={}, cause={}, message={}", path, e.getClass().getName(), e.getMessage(), e);
            throw new IllegalArgumentException("카드 등록 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.", e);
        }
    }

    // 부트페이 GET API를 공통 포맷으로 호출한다.
    private Map<String, Object> get(String path) {
        try {
            String responseBody = restClient.get()
                    .uri(serverBaseUrl + path)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + getAccessToken())
                    .retrieve()
                    .body(String.class);
            return objectMapper.readValue(responseBody, new TypeReference<>() {});
        } catch (RestClientResponseException e) {
            log.error("Bootpay GET failed path={}, status={}, body={}", path, e.getStatusCode().value(), e.getResponseBodyAsString(), e);
            throw new IllegalArgumentException("카드 등록 정보를 확인하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.", e);
        } catch (Exception e) {
            log.error("Bootpay GET failed path={}, cause={}, message={}", path, e.getClass().getName(), e.getMessage(), e);
            throw new IllegalArgumentException("카드 등록 정보를 확인하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.", e);
        }
    }

    // 부트페이 서버 호출에 사용할 access_token을 발급받는다.
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
        } catch (RestClientResponseException e) {
            log.error("Bootpay token failed status={}, body={}", e.getStatusCode().value(), e.getResponseBodyAsString(), e);
            throw new IllegalArgumentException("결제 서비스 연결에 문제가 있습니다. 잠시 후 다시 시도해 주세요.", e);
        } catch (Exception e) {
            log.error("Bootpay token failed cause={}, message={}", e.getClass().getName(), e.getMessage(), e);
            throw new IllegalArgumentException("결제 서비스 연결에 문제가 있습니다. 잠시 후 다시 시도해 주세요.", e);
        }
    }

    private String resolveUserFriendlyMessage(String responseBody, String fallback) {
        String body = responseBody == null ? "" : responseBody;

        if (body.contains("INVALID_CARD_NUMBER")) {
            return "카드 번호를 다시 확인해 주세요.";
        }
        if (body.contains("RC_PG_NOT_FOUND")) {
            return "현재 선택한 결제 수단을 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.";
        }
        if (body.contains("APP_FIREWALL_BLOCKED")) {
            return "결제 서비스 연결이 제한되어 있습니다. 관리자에게 문의해 주세요.";
        }
        if (body.contains("SUBSCRIBE_PUBLISH_FAILED")) {
            return "등록할 수 없는 카드입니다. 다른 카드를 입력해 주세요.";
        }
        if (body.contains("card_expire") || body.contains("expire")) {
            return "카드 유효기간을 다시 확인해 주세요.";
        }
        if (body.contains("identity")) {
            return "생년월일 6자리를 다시 확인해 주세요.";
        }
        if (body.contains("card_pw")) {
            return "카드 비밀번호 앞 2자리를 다시 확인해 주세요.";
        }

        return fallback;
    }

    @SuppressWarnings("unchecked")
    // 부트페이 응답 객체를 Map 형태로 안전하게 변환한다.
    private Map<String, Object> asMap(Object value) {
        if (value instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return Map.of();
    }

    // 부트페이 응답 값을 문자열로 정규화한다.
    private String asText(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
