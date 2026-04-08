package com.app.bideo.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public enum ReportReason {
    SENSITIVE("SENSITIVE"),
    IMPERSONATION("IMPERSONATION"),
    HARASSMENT("HARASSMENT"),
    COPYRIGHT("COPYRIGHT");

    private final String value;

    private static final Map<String, ReportReason> LOOKUP =
            Stream.of(values()).collect(Collectors.toMap(ReportReason::getValue, Function.identity()));

    ReportReason(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ReportReason from(String value) {
        if (value == null) {
            return null;
        }
        return LOOKUP.get(value.toUpperCase(Locale.ROOT));
    }
}
