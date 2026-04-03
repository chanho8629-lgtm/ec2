package com.app.bideo.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public enum MemberStatus {
    ACTIVE("ACTIVE"),
    SUSPENDED("SUSPENDED"),
    BANNED("BANNED");

    private final String value;

    private static final Map<String, MemberStatus> LOOKUP =
            Stream.of(values()).collect(Collectors.toMap(MemberStatus::getValue, Function.identity()));

    MemberStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static MemberStatus from(String value) {
        if (value == null) {
            return null;
        }
        return LOOKUP.get(value.toUpperCase(Locale.ROOT));
    }
}
