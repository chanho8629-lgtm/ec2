package com.app.bideo.auth.member;

import com.app.bideo.common.enumeration.OAuthProvider;
import lombok.Builder;
import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

@Getter
@Builder
public class OAuth2Attribute {
    private OAuthProvider provider;
    private String id;
    private String email;
    private String name;
    private String profileImage;

    public static OAuth2Attribute of(String provider, Map<String, Object> attributes) {
        OAuthProvider oauthProvider = OAuthProvider.from(provider);
        if (oauthProvider == null) {
            throw new IllegalArgumentException("지원하지 않는 OAuth provider 입니다: " + provider);
        }
        return switch (oauthProvider) {
            case KAKAO -> ofKakao(attributes);
            case NAVER -> ofNaver(attributes);
            case GOOGLE -> ofGoogle(attributes);
        };
    }

    @SuppressWarnings("unchecked")
    private static OAuth2Attribute ofKakao(Map<String, Object> attributes) {
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        Map<String, Object> kakaoProfile = kakaoAccount == null ? null : (Map<String, Object>) kakaoAccount.get("profile");

        return OAuth2Attribute.builder()
                .provider(OAuthProvider.KAKAO)
                .id(String.valueOf(attributes.get("id")))
                .email(kakaoAccount == null ? null : (String) kakaoAccount.get("email"))
                .name(kakaoProfile == null ? null : (String) kakaoProfile.get("nickname"))
                .profileImage(kakaoProfile == null ? null : (String) kakaoProfile.get("profile_image_url"))
                .build();
    }

    @SuppressWarnings("unchecked")
    private static OAuth2Attribute ofNaver(Map<String, Object> attributes) {
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");

        return OAuth2Attribute.builder()
                .provider(OAuthProvider.NAVER)
                .id(response == null ? null : String.valueOf(response.get("id")))
                .email(response == null ? null : (String) response.get("email"))
                .name(response == null ? null : (String) response.get("name"))
                .profileImage(response == null ? null : (String) response.get("profile_image"))
                .build();
    }

    private static OAuth2Attribute ofGoogle(Map<String, Object> attributes) {
        return OAuth2Attribute.builder()
                .provider(OAuthProvider.GOOGLE)
                .id(String.valueOf(attributes.get("sub")))
                .email((String) attributes.get("email"))
                .name((String) attributes.get("name"))
                .profileImage((String) attributes.get("picture"))
                .build();
    }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("provider", provider == null ? null : provider.getValue());
        map.put("id", id);
        map.put("email", email);
        map.put("name", name);
        map.put("profileImage", profileImage);
        return map;
    }
}
