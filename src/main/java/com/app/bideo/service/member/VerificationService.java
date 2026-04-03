package com.app.bideo.service.member;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class VerificationService {
    private static final Duration VERIFICATION_TTL = Duration.ofMinutes(3);
    private static final String PHONE_PREFIX = "verification:phone:";
    private static final String EMAIL_PREFIX = "verification:email:";

    private final RedisTemplate<String, Object> redisTemplate;

    public void sendPhoneVerificationCode(String phoneNumber, SmsService smsService) {
        String normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
        String verificationCode = createVerificationCode();
        redisTemplate.opsForValue().set(phoneKey(normalizedPhoneNumber), verificationCode, VERIFICATION_TTL);
        smsService.sendVerificationCode(normalizedPhoneNumber, verificationCode);
    }

    public void verifyPhoneCode(String phoneNumber, String verificationCode) {
        verifyCode(phoneKey(normalizePhoneNumber(phoneNumber)), verificationCode);
    }

    public void sendEmailVerificationCode(String email, MailService mailService) {
        String normalizedEmail = normalizeEmail(email);
        String verificationCode = createVerificationCode();
        redisTemplate.opsForValue().set(emailKey(normalizedEmail), verificationCode, VERIFICATION_TTL);
        mailService.sendVerificationCode(normalizedEmail, verificationCode);
    }

    public void verifyEmailCode(String email, String verificationCode) {
        verifyCode(emailKey(normalizeEmail(email)), verificationCode);
    }

    public void clearEmailCode(String email) {
        redisTemplate.delete(emailKey(normalizeEmail(email)));
    }

    private void verifyCode(String key, String verificationCode) {
        if (!StringUtils.hasText(verificationCode)) {
            throw new IllegalArgumentException("인증번호를 입력하세요.");
        }

        Object savedCode = redisTemplate.opsForValue().get(key);
        if (savedCode == null) {
            throw new IllegalArgumentException("인증번호가 만료되었거나 존재하지 않습니다.");
        }
        if (!verificationCode.equals(savedCode.toString())) {
            throw new IllegalArgumentException("인증번호가 일치하지 않습니다.");
        }
    }

    private String createVerificationCode() {
        return String.format("%06d", ThreadLocalRandom.current().nextInt(0, 1000000));
    }

    private String normalizePhoneNumber(String phoneNumber) {
        if (!StringUtils.hasText(phoneNumber)) {
            throw new IllegalArgumentException("전화번호를 입력하세요.");
        }

        return phoneNumber.replaceAll("[^0-9]", "");
    }

    private String normalizeEmail(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("이메일을 입력하세요.");
        }

        return email.trim().toLowerCase();
    }

    private String phoneKey(String phoneNumber) {
        return PHONE_PREFIX + phoneNumber;
    }

    private String emailKey(String email) {
        return EMAIL_PREFIX + email;
    }
}
