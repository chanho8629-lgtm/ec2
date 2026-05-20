package com.app.bideo.config;

public final class FastApiUrlSupport {

    private FastApiUrlSupport() {
    }

    public static String normalize(String baseUrl) {
        if (baseUrl == null) {
            return "";
        }

        String normalized = baseUrl.trim();
        if (normalized.isBlank()) {
            return "";
        }

        if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
            normalized = "https://" + normalized;
        }

        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }
}
