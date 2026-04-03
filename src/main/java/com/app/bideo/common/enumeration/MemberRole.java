package com.app.bideo.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public enum MemberRole {
    ADMIN("ADMIN"), USER("USER");

    private final String value;

    private static final Map<String, MemberRole> LOOKUP =
            Stream.of(values()).collect(Collectors.toMap(MemberRole::getValue, Function.identity()));

    MemberRole(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static MemberRole from(String value) {
        if (value == null) {
            return null;
        }
        return LOOKUP.get(value.toUpperCase(Locale.ROOT));
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + value));
    }
}
