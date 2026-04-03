package com.app.bideo.service.member;

import com.app.bideo.common.enumeration.MemberRole;
import com.app.bideo.common.enumeration.MemberStatus;
import com.app.bideo.common.enumeration.OAuthProvider;
import com.app.bideo.domain.member.MemberVO;
import com.app.bideo.domain.member.OAuthLoginVO;
import com.app.bideo.dto.member.MemberSignupRequestDTO;
import com.app.bideo.repository.member.MemberRepository;
import com.app.bideo.repository.member.OAuthLoginRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final MemberRepository memberRepository;
    private final OAuthLoginRepository oAuthLoginRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public MemberVO signup(MemberSignupRequestDTO requestDTO) {
        if (!StringUtils.hasText(requestDTO.getEmail())
                || !StringUtils.hasText(requestDTO.getPassword())
                || !StringUtils.hasText(requestDTO.getNickname())) {
            throw new IllegalArgumentException("이메일, 비밀번호, 닉네임은 필수입니다.");
        }

        if (memberRepository.findByEmail(requestDTO.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        if (memberRepository.existsByNickname(requestDTO.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        MemberVO memberVO = MemberVO.builder()
                .email(requestDTO.getEmail())
                .password(passwordEncoder.encode(requestDTO.getPassword()))
                .nickname(requestDTO.getNickname())
                .realName(requestDTO.getRealName())
                .birthDate(requestDTO.getBirthDate())
                .phoneNumber(requestDTO.getPhoneNumber())
                .role(MemberRole.USER)
                .status(MemberStatus.ACTIVE)
                .creatorVerified(false)
                .sellerVerified(false)
                .creatorTier("BASIC")
                .followerCount(0)
                .followingCount(0)
                .galleryCount(0)
                .build();

        memberRepository.save(memberVO);
        return memberVO;
    }

    @Transactional
    public MemberVO upsertOAuthMember(String provider, String providerId, String email, String name, String profileImage) {
        OAuthProvider oauthProvider = OAuthProvider.from(provider);
        OAuthLoginVO oAuthLogin = oAuthLoginRepository.findByProviderAndProviderId(oauthProvider, providerId).orElse(null);
        if (oAuthLogin != null) {
            MemberVO existingMember = memberRepository.findById(oAuthLogin.getMemberId())
                    .orElseThrow(() -> new IllegalArgumentException("OAuth 회원을 찾을 수 없습니다."));
            memberRepository.updateLastLogin(existingMember.getId());
            return existingMember;
        }

        MemberVO memberVO = memberRepository.findByEmail(email)
                .orElseGet(() -> createOAuthMember(provider, providerId, email, name, profileImage));

        if (oAuthLoginRepository.findByMemberIdAndProvider(memberVO.getId(), oauthProvider).isEmpty()) {
            oAuthLoginRepository.save(OAuthLoginVO.builder()
                    .memberId(memberVO.getId())
                    .provider(oauthProvider)
                    .providerId(providerId)
                    .build());
        }

        memberRepository.updateLastLogin(memberVO.getId());
        return memberVO;
    }

    @Transactional
    public void updateLastLogin(Long memberId) {
        memberRepository.updateLastLogin(memberId);
    }

    @Transactional(readOnly = true)
    public MemberVO findActiveMemberByPhoneNumber(String phoneNumber) {
        return memberRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("해당 전화번호로 가입된 회원이 없습니다."));
    }

    @Transactional(readOnly = true)
    public MemberVO findActiveMemberByEmail(String email) {
        return memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일로 가입된 회원이 없습니다."));
    }

    @Transactional
    public void resetPasswordByEmail(String email, String newPassword, String confirmPassword) {
        if (!StringUtils.hasText(newPassword) || !StringUtils.hasText(confirmPassword)) {
            throw new IllegalArgumentException("새 비밀번호를 입력하세요.");
        }
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("비밀번호 확인이 일치하지 않습니다.");
        }

        MemberVO memberVO = findActiveMemberByEmail(email);
        if (memberVO.getPassword() == null) {
            throw new IllegalArgumentException("OAuth 전용 회원은 비밀번호를 재설정할 수 없습니다.");
        }

        memberRepository.updatePassword(memberVO.getId(), passwordEncoder.encode(newPassword));
    }

    private MemberVO createOAuthMember(String provider, String providerId, String email, String name, String profileImage) {
        String baseEmail = StringUtils.hasText(email) ? email : createBaseEmail(provider, providerId);
        String baseNickname = StringUtils.hasText(name) ? name : sanitize(provider + "_" + providerId);

        MemberVO memberVO = MemberVO.builder()
                .email(baseEmail)
                .password(null)
                .nickname(makeUniqueNickname(baseNickname))
                .realName(name)
                .profileImage(profileImage)
                .role(MemberRole.USER)
                .status(MemberStatus.ACTIVE)
                .creatorVerified(false)
                .sellerVerified(false)
                .creatorTier("BASIC")
                .followerCount(0)
                .followingCount(0)
                .galleryCount(0)
                .build();

        memberRepository.save(memberVO);
        return memberVO;
    }

    private String createBaseEmail(String provider, String providerId) {
        return provider.toLowerCase() + "_" + providerId + "@oauth.local";
    }

    private String makeUniqueNickname(String base) {
        String seed = sanitize(base);
        String candidate = seed;
        int suffix = 1;
        while (memberRepository.existsByNickname(candidate)) {
            candidate = seed + suffix++;
        }
        return candidate;
    }

    private String sanitize(String value) {
        String sanitized = value == null ? "" : value.replaceAll("[^a-zA-Z0-9가-힣_]", "");
        return sanitized.isBlank() ? "bideoUser" : sanitized;
    }
}
