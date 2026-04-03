package com.app.bideo.auth.member;

import com.app.bideo.domain.member.MemberVO;
import com.app.bideo.service.member.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String provider = (String) oAuth2User.getAttribute("provider");
        String providerId = Objects.toString(oAuth2User.getAttribute("id"), null);
        String email = (String) oAuth2User.getAttribute("email");
        String name = (String) oAuth2User.getAttribute("name");
        String profileImage = (String) oAuth2User.getAttribute("profileImage");

        MemberVO memberVO = authService.upsertOAuthMember(provider, providerId, email, name, profileImage);
        jwtTokenProvider.createAccessToken(memberVO.getEmail(), provider, response);
        jwtTokenProvider.createRefreshToken(memberVO.getEmail(), provider, response);

        response.sendRedirect("/");
    }
}
