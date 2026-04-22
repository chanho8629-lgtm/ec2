package com.app.bideo.controller.member;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.auth.member.JwtTokenProvider;
import com.app.bideo.domain.member.MemberVO;
import com.app.bideo.dto.member.MemberLoginRequestDTO;
import com.app.bideo.dto.member.MemberSignupRequestDTO;
import com.app.bideo.dto.member.PasswordResetRequestDTO;
import com.app.bideo.dto.member.PhoneVerificationConfirmRequestDTO;
import com.app.bideo.dto.member.PhoneVerificationSendRequestDTO;
import com.app.bideo.dto.member.EmailVerificationConfirmRequestDTO;
import com.app.bideo.dto.member.EmailVerificationSendRequestDTO;
import com.app.bideo.repository.member.MemberRepository;
import com.app.bideo.service.member.AuthService;
import com.app.bideo.service.member.MailService;
import com.app.bideo.service.member.SmsService;
import com.app.bideo.service.member.VerificationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;
    private final SmsService smsService;
    private final MailService mailService;
    private final VerificationService verificationService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody MemberSignupRequestDTO requestDTO) {
        MemberVO memberVO = authService.signup(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", memberVO.getId(),
                "email", memberVO.getEmail(),
                "nickname", memberVO.getNickname()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody MemberLoginRequestDTO requestDTO, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(requestDTO.getEmail(), requestDTO.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        MemberVO memberVO = memberRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        if (memberVO.getRole() == com.app.bideo.common.enumeration.MemberRole.ADMIN) {
            SecurityContextHolder.clearContext();
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "관리자는 관리자 로그인을 이용해 주세요."));
        }

        authService.updateLastLogin(memberVO.getId());
        String accessToken = jwtTokenProvider.createAccessToken(memberVO.getEmail(), "LOCAL", response);
        jwtTokenProvider.createRefreshToken(memberVO.getEmail(), "LOCAL", response);

        return ResponseEntity.ok(Map.of(
                "accessToken", accessToken,
                "email", memberVO.getEmail(),
                "nickname", memberVO.getNickname()
        ));
    }

    @PostMapping("/admin-login")
    public ResponseEntity<?> adminLogin(@RequestBody MemberLoginRequestDTO requestDTO, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(requestDTO.getEmail(), requestDTO.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        MemberVO memberVO = memberRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        if (memberVO.getRole() != com.app.bideo.common.enumeration.MemberRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "관리자 권한이 없습니다."));
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        authService.updateLastLogin(memberVO.getId());
        String accessToken = jwtTokenProvider.createAccessToken(memberVO.getEmail(), "LOCAL", response);
        jwtTokenProvider.createRefreshToken(memberVO.getEmail(), "LOCAL", response);

        return ResponseEntity.ok(Map.of(
                "accessToken", accessToken,
                "email", memberVO.getEmail(),
                "nickname", memberVO.getNickname()
        ));
    }

    @PostMapping("/logout")
    // 로컬 로그인은 서버 토큰 상태를 정리하고, 소셜 로그인은 쿠키만 제거한다.
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        String accessToken = jwtTokenProvider.resolveAccessToken(request);
        if (jwtTokenProvider.validateToken(accessToken)) {
            String provider = jwtTokenProvider.getProvider(accessToken);
            if ("LOCAL".equalsIgnoreCase(provider)) {
                String email = jwtTokenProvider.getEmail(accessToken);
                jwtTokenProvider.deleteRefreshToken(email);
                jwtTokenProvider.addToBlacklist(accessToken);
            }
        }
        jwtTokenProvider.clearTokenCookies(response);
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "로그아웃이 완료되었습니다."));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        String accessToken = jwtTokenProvider.resolveAccessToken(request);
        if (!jwtTokenProvider.validateToken(accessToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "로그인이 필요합니다."));
        }

        String email = jwtTokenProvider.getEmail(accessToken);
        return memberRepository.findByEmail(email)
                .map(member -> ResponseEntity.ok(Map.of(
                        "id", member.getId(),
                        "email", member.getEmail(),
                        "nickname", member.getNickname(),
                        "profileImage", member.getProfileImage() == null ? "" : member.getProfileImage()
                )))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "회원이 없습니다.")));
    }

    @PostMapping("/verification/phone/send")
    public ResponseEntity<?> sendPhoneVerificationCode(@RequestBody PhoneVerificationSendRequestDTO requestDTO) {
        try {
            verificationService.sendPhoneVerificationCode(requestDTO.getPhoneNumber(), smsService);
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of(
                    "message", "문자 인증번호 전송에 실패했습니다. 잠시 후 다시 시도해 주세요."
            ));
        }
        return ResponseEntity.ok(Map.of("message", "인증번호를 전송했습니다."));
    }

    @PostMapping("/verification/phone/confirm")
    public ResponseEntity<?> confirmPhoneVerificationCode(@RequestBody PhoneVerificationConfirmRequestDTO requestDTO) {
        verificationService.verifyPhoneCode(requestDTO.getPhoneNumber(), requestDTO.getVerificationCode());
        MemberVO memberVO = authService.findActiveMemberByPhoneNumber(requestDTO.getPhoneNumber());
        return ResponseEntity.ok(Map.of(
                "message", "전화번호 인증이 완료되었습니다.",
                "email", memberVO.getEmail()
        ));
    }

    @PostMapping("/verification/email/send")
    public ResponseEntity<?> sendEmailVerificationCode(@RequestBody EmailVerificationSendRequestDTO requestDTO) {
        authService.findActiveMemberByEmail(requestDTO.getEmail());
        try {
            verificationService.sendEmailVerificationCode(requestDTO.getEmail(), mailService);
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of(
                    "message", "이메일 인증번호 전송에 실패했습니다. 잠시 후 다시 시도해 주세요."
            ));
        }
        return ResponseEntity.ok(Map.of("message", "인증번호를 전송했습니다."));
    }

    @PostMapping("/verification/email/confirm")
    public ResponseEntity<?> confirmEmailVerificationCode(@RequestBody EmailVerificationConfirmRequestDTO requestDTO) {
        authService.findActiveMemberByEmail(requestDTO.getEmail());
        verificationService.verifyEmailCode(requestDTO.getEmail(), requestDTO.getVerificationCode());
        return ResponseEntity.ok(Map.of("message", "이메일 인증이 완료되었습니다."));
    }

    @PostMapping("/password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetRequestDTO requestDTO) {
        verificationService.verifyEmailCode(requestDTO.getEmail(), requestDTO.getVerificationCode());
        authService.resetPasswordByEmail(requestDTO.getEmail(), requestDTO.getNewPassword(), requestDTO.getConfirmPassword());
        verificationService.clearEmailCode(requestDTO.getEmail());
        return ResponseEntity.ok(Map.of("message", "비밀번호가 변경되었습니다."));
    }
}
