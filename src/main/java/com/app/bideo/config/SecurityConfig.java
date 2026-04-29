package com.app.bideo.config;

import com.app.bideo.auth.member.AuthenticationFilter;
import com.app.bideo.auth.member.AuthenticationHandler;
import com.app.bideo.auth.member.AuthorizationHandler;
import com.app.bideo.auth.member.OAuth2SuccessHandler;
import com.app.bideo.service.member.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final AuthenticationHandler authenticationHandler;
    private final AuthorizationHandler authorizationHandler;
    private final AuthenticationFilter authenticationFilter;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.sameOrigin())
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/dashboard", "/dashboard/**").authenticated()
                        .requestMatchers("/api/dashboard", "/api/dashboard/**").authenticated()
                        .requestMatchers("/api/cards", "/api/cards/**").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/works/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/galleries", "/api/galleries/*", "/api/galleries/*/comments").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/gallery-register", "/gallery/gallery-register").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/gallery/*").permitAll()
                        .requestMatchers(
                                "/",
                                "/main",
                                "/results",
                                "/error",
                                "/error-page",
                                "/api/search/**",
                                "/api/auth/**",
                                "/oauth2/**",
                                "/login/oauth2/**",
                                "/css/**",
                                "/js/**",
                                "/images/**",
                                "/image/**",
                                "/media/**",
                                "/static/**"
                        ).permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationHandler)
                        .accessDeniedHandler(authorizationHandler)
                )
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                        .successHandler(oAuth2SuccessHandler)
                )
                .addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
