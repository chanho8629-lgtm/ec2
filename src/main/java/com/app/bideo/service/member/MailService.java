package com.app.bideo.service.member;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {
    private final JavaMailSender javaMailSender;

    @Value("${app.mail.from-address:no-reply@bideo.local}")
    private String fromAddress;

    public void sendVerificationCode(String email, String verificationCode) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("이메일을 입력하세요.");
        }

        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
            mimeMessageHelper.setFrom(fromAddress);
            mimeMessageHelper.setTo(email);
            mimeMessageHelper.setSubject("[BIDEO] 이메일 인증번호");
            mimeMessageHelper.setText("인증번호는 " + verificationCode + " 입니다.", false);
            javaMailSender.send(mimeMessage);
        } catch (MessagingException exception) {
            log.error("메일 생성 실패", exception);
            throw new IllegalStateException("이메일 전송에 실패했습니다.");
        } catch (Exception exception) {
            log.error("메일 전송 실패", exception);
            throw new IllegalStateException("이메일 전송 중 오류가 발생했습니다.");
        }
    }
}
