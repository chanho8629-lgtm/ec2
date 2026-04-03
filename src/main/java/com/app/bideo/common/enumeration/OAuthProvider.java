package com.app.bideo.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public enum OAuthProvider {
    NAVER("naver"), KAKAO("kakao");

    private final String value;

    private static final Map<String, OAuthProvider> LOOKUP =
            Stream.of(values()).collect(Collectors.toMap(OAuthProvider::getValue, Function.identity()));

    OAuthProvider(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static OAuthProvider from(String value) {
        if (value == null) {
            return null;
        }
        return LOOKUP.get(value.toLowerCase(Locale.ROOT));
    }
}
