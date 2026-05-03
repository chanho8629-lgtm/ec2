package com.app.bideo.controller.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice(annotations = org.springframework.web.bind.annotation.RestController.class)
public class ApiExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("message", resolveMessage(exception, "bad request")));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuthentication(AuthenticationException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", resolveMessage(exception, "authentication failed")));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException exception) {
        String message = resolveMessage(exception, "request failed");
        HttpStatus status;
        if ("login required".equals(message)) {
            status = HttpStatus.UNAUTHORIZED;
        } else if ("forbidden".equals(message)) {
            status = HttpStatus.FORBIDDEN;
        } else if ("comment not allowed".equals(message)) {
            status = HttpStatus.CONFLICT;
        } else if (message.startsWith("S3 file upload failed")) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        } else {
            status = HttpStatus.CONFLICT;
        }
        return ResponseEntity.status(status).body(Map.of("message", message));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException exception) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", resolveMessage(exception, "internal server error")));
    }

    private String resolveMessage(RuntimeException exception, String fallback) {
        String message = exception.getMessage();
        if (message == null || message.isBlank()) {
            return fallbackMessage(fallback);
        }
        return normalizeMessage(message);
    }

    private String normalizeMessage(String message) {
        if ("login required".equals(message) || message.contains("Full authentication is required")) {
            return "로그인이 필요합니다.";
        }
        if ("forbidden".equals(message) || message.contains("Access Denied")) {
            return "접근 권한이 없습니다.";
        }
        if ("comment not allowed".equals(message)) {
            return "댓글이 비활성화된 작품 또는 예술관입니다.";
        }
        if (message.contains("work not found")) {
            return "작품 정보를 찾을 수 없습니다.";
        }
        if (message.contains("gallery not found")) {
            return "예술관 정보를 찾을 수 없습니다.";
        }
        if (message.contains("member not found")) {
            return "회원 정보를 찾을 수 없습니다.";
        }
        if (message.contains("order not found") || message.contains("주문을 찾을 수 없습니다.")) {
            return "주문 정보를 찾을 수 없습니다.";
        }
        if (message.contains("payment not found") || message.contains("결제를 찾을 수 없습니다.")) {
            return "결제 정보를 찾을 수 없습니다.";
        }
        if (message.contains("card not found") || message.contains("카드를 찾을 수 없습니다.")) {
            return "카드 정보를 찾을 수 없습니다.";
        }
        if (message.contains("S3") || message.contains("presigned") || message.contains("Failed to fetch")) {
            return "파일을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
        }
        if (message.contains("부트페이") || message.contains("card_") || message.contains("INVALID_") || message.contains("RC_")) {
            return message;
        }
        if (message.contains("JSON") || message.contains("Redis") || message.contains("Serialization")) {
            return "화면 정보를 불러오는 중 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요.";
        }
        return message;
    }

    private String fallbackMessage(String fallback) {
        if ("bad request".equals(fallback)) {
            return "요청 내용을 다시 확인해 주세요.";
        }
        if ("authentication failed".equals(fallback)) {
            return "로그인이 필요합니다.";
        }
        if ("request failed".equals(fallback)) {
            return "요청 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
        }
        return "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
    }
}
