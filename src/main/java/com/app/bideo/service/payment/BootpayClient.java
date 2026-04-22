package com.app.bideo.service.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class BootpayClient {

    private final ObjectMapper objectMapper;

    @Value("${bootpay.rest-client-key:}")
    private String restClientKey;

    @Value("${bootpay.private-key:}")
    private String privateKey;

    private final RestClient restClient = RestClient.builder().build();

    public JsonNode getReceipt(String receiptId) {
        String accessToken = issueAccessToken();

        String response = restClient.get()
                .uri("https://api.bootpay.co.kr/v2/receipt/{receiptId}", receiptId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .body(String.class);

        return readTree(response);
    }

    private String issueAccessToken() {
        if (restClientKey == null || restClientKey.isBlank() || privateKey == null || privateKey.isBlank()) {
            throw new IllegalStateException("부트페이 서버 연동키가 설정되지 않았습니다.");
        }

        String basicToken = Base64.getEncoder()
                .encodeToString((restClientKey + ":" + privateKey).getBytes(StandardCharsets.UTF_8));

        String response = restClient.post()
                .uri("https://api.bootapi.com/v1/request/token")
                .header(HttpHeaders.AUTHORIZATION, "Basic " + basicToken)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "client_key", restClientKey,
                        "secret_key", privateKey
                ))
                .retrieve()
                .body(String.class);

        JsonNode jsonNode = readTree(response);
        String accessToken = jsonNode.path("access_token").asText("");
        if (accessToken.isBlank()) {
            throw new IllegalStateException("부트페이 액세스 토큰 발급에 실패했습니다.");
        }
        return accessToken;
    }

    private JsonNode readTree(String payload) {
        try {
            return objectMapper.readTree(payload);
        } catch (Exception e) {
            throw new IllegalStateException("부트페이 응답을 해석하지 못했습니다.", e);
        }
    }
}
