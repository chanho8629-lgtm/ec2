package com.app.bideo.auth.member;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class AuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    // 토큰이 남아 있어도 회원 정보가 사라진 경우에는 비로그인 상태로 정리한다.
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            String accessToken = jwtTokenProvider.resolveAccessToken(request);

            if (jwtTokenProvider.validateToken(accessToken)) {
                Authentication authentication = jwtTokenProvider.getAuthentication(accessToken);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                String refreshToken = jwtTokenProvider.resolveRefreshToken(request);
                if (jwtTokenProvider.validateToken(refreshToken)) {
                    String email = jwtTokenProvider.getEmail(refreshToken);
                    if (jwtTokenProvider.checkRefreshTokenBetweenCookieAndRedis(email, refreshToken)) {
                        Authentication authentication = jwtTokenProvider.getAuthentication(refreshToken);
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                        String provider = jwtTokenProvider.getProvider(refreshToken);
                        jwtTokenProvider.createAccessToken(userDetails.getEmail(), provider, response);
                        jwtTokenProvider.createRefreshToken(userDetails.getEmail(), provider, response);
                    }
                }
            }
        } catch (UsernameNotFoundException exception) {
            clearStaleAuthentication(request, response);
        }

        filterChain.doFilter(request, response);
    }

    // DB 초기화 등으로 회원이 사라진 토큰은 쿠키와 서버 인증 상태를 함께 정리한다.
    private void clearStaleAuthentication(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = jwtTokenProvider.resolveRefreshToken(request);
        if (jwtTokenProvider.validateToken(refreshToken)) {
            jwtTokenProvider.deleteRefreshToken(jwtTokenProvider.getEmail(refreshToken));
        }

        jwtTokenProvider.clearTokenCookies(response);
        SecurityContextHolder.clearContext();
    }
}
