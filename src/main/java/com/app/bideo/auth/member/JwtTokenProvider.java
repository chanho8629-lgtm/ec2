package com.app.bideo.auth.member;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.security.Key;
import java.time.Duration;
import java.util.Arrays;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {
    private static final String ACCESS_TOKEN_COOKIE = "accessToken";
    private static final String REFRESH_TOKEN_COOKIE = "refreshToken";
    private static final String REFRESH_TOKEN_PREFIX = "refresh:";
    private static final String BLACKLIST_PREFIX = "blacklist:";
    private static final long ACCESS_TOKEN_EXPIRE_TIME = 1000L * 60 * 10;
    private static final long REFRESH_TOKEN_EXPIRE_TIME = 1000L * 60 * 60 * 24;

    private final RedisTemplate<String, Object> redisTemplate;
    private final UserDetailsService userDetailsService;

    @Value("${jwt.secret}")
    private String secretKey;

    private Key key;

    @PostConstruct
    public void init() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public String createAccessToken(String email, String provider, HttpServletResponse response) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + ACCESS_TOKEN_EXPIRE_TIME);

        String token = Jwts.builder()
                .setSubject(email)
                .claim("email", email)
                .claim("provider", provider)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        addCookie(response, ACCESS_TOKEN_COOKIE, token, ACCESS_TOKEN_EXPIRE_TIME);
        return token;
    }

    public String createRefreshToken(String email, String provider, HttpServletResponse response) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + REFRESH_TOKEN_EXPIRE_TIME);

        String token = Jwts.builder()
                .setSubject(email)
                .claim("provider", provider)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_PREFIX + email,
                token,
                REFRESH_TOKEN_EXPIRE_TIME,
                TimeUnit.MILLISECONDS
        );
        addCookie(response, REFRESH_TOKEN_COOKIE, token, REFRESH_TOKEN_EXPIRE_TIME);
        return token;
    }

    public Authentication getAuthentication(String token) {
        String email = getEmail(token);
        CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(email);
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }

    public String getEmail(String token) {
        return getClaims(token).getSubject();
    }

    public String getProvider(String token) {
        Object provider = getClaims(token).get("provider");
        return provider == null ? "LOCAL" : provider.toString();
    }

    public boolean validateToken(String token) {
        if (!StringUtils.hasText(token)) {
            return false;
        }
        try {
            Claims claims = getClaims(token);
            return claims.getExpiration().after(new Date()) && !isBlacklisted(token);
        } catch (Exception e) {
            return false;
        }
    }

    public String resolveAccessToken(HttpServletRequest request) {
        return getCookieValue(request, ACCESS_TOKEN_COOKIE);
    }

    public String resolveRefreshToken(HttpServletRequest request) {
        return getCookieValue(request, REFRESH_TOKEN_COOKIE);
    }

    public boolean checkRefreshTokenBetweenCookieAndRedis(String email, String cookieRefreshToken) {
        Object redisRefreshToken = redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + email);
        return redisRefreshToken != null && redisRefreshToken.equals(cookieRefreshToken);
    }

    public void deleteRefreshToken(String email) {
        redisTemplate.delete(REFRESH_TOKEN_PREFIX + email);
    }

    public void addToBlacklist(String accessToken) {
        long remainMillis = getClaims(accessToken).getExpiration().getTime() - System.currentTimeMillis();
        if (remainMillis > 0) {
            redisTemplate.opsForValue().set(BLACKLIST_PREFIX + accessToken, true, remainMillis, TimeUnit.MILLISECONDS);
        }
    }

    public void clearTokenCookies(HttpServletResponse response) {
        removeCookie(response, ACCESS_TOKEN_COOKIE);
        removeCookie(response, REFRESH_TOKEN_COOKIE);
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + token));
    }

    private String getCookieValue(HttpServletRequest request, String cookieName) {
        if (request.getCookies() == null) {
            return null;
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(StringUtils::hasText)
                .findFirst()
                .orElse(null);
    }

    private void addCookie(HttpServletResponse response, String name, String value, long expireTimeMillis) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge((int) Duration.ofMillis(expireTimeMillis).getSeconds());
        response.addCookie(cookie);
    }

    private void removeCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
