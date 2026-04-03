package com.app.bideo.service.member;

import com.solapi.sdk.SolapiClient;
import com.solapi.sdk.message.exception.SolapiMessageNotReceivedException;
import com.solapi.sdk.message.model.Message;
import com.solapi.sdk.message.service.DefaultMessageService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@Slf4j
public class SmsService {
    @Value("${solapi.api-key:}")
    private String apiKey;

    @Value("${solapi.api-secret:}")
    private String apiSecret;

    @Value("${solapi.from-number:}")
    private String fromNumber;

    private DefaultMessageService messageService;

    @PostConstruct
    private void init() {
        if (StringUtils.hasText(apiKey) && StringUtils.hasText(apiSecret)) {
            this.messageService = SolapiClient.INSTANCE.createInstance(apiKey, apiSecret);
        }

        log.info(
                "SmsService initialized. solapiConfigured={}, fromNumber={}, apiKeyPrefix={}",
                messageService != null,
                maskPhoneNumber(fromNumber),
                maskSecretPrefix(apiKey, 6)
        );
    }

    public void sendVerificationCode(String phoneNumber, String verificationCode) {
        if (!StringUtils.hasText(phoneNumber)) {
            throw new IllegalArgumentException("전화번호를 입력하세요.");
        }
        if (!StringUtils.hasText(fromNumber)) {
            throw new IllegalStateException("Solapi 발신 번호가 설정되지 않았습니다.");
        }
        if (messageService == null) {
            throw new IllegalStateException("Solapi 설정이 완료되지 않았습니다.");
        }

        Message message = new Message();
        message.setFrom(fromNumber);
        message.setTo(phoneNumber);
        message.setText("[BIDEO] 인증번호는 " + verificationCode + " 입니다.");

        log.info(
                "Attempting SMS send. from={}, to={}, verificationCodeLength={}",
                maskPhoneNumber(fromNumber),
                maskPhoneNumber(phoneNumber),
                verificationCode == null ? 0 : verificationCode.length()
        );

        try {
            messageService.send(message);
            log.info(
                    "SMS send accepted. from={}, to={}",
                    maskPhoneNumber(fromNumber),
                    maskPhoneNumber(phoneNumber)
            );
        } catch (SolapiMessageNotReceivedException exception) {
            log.error(
                    "SMS send rejected. from={}, to={}, reason={}",
                    maskPhoneNumber(fromNumber),
                    maskPhoneNumber(phoneNumber),
                    exception.getMessage(),
                    exception
            );
            throw new IllegalStateException("문자 전송에 실패했습니다.");
        } catch (Exception exception) {
            log.error(
                    "SMS send error. from={}, to={}",
                    maskPhoneNumber(fromNumber),
                    maskPhoneNumber(phoneNumber),
                    exception
            );
            throw new IllegalStateException("문자 전송 중 오류가 발생했습니다.");
        }
    }

    private String maskPhoneNumber(String value) {
        if (!StringUtils.hasText(value)) {
            return "(empty)";
        }

        String digits = value.replaceAll("[^0-9]", "");
        if (digits.length() <= 4) {
            return digits;
        }
        if (digits.length() <= 8) {
            return digits.substring(0, 2) + "****" + digits.substring(digits.length() - 2);
        }
        return digits.substring(0, 3) + "****" + digits.substring(digits.length() - 4);
    }

    private String maskSecretPrefix(String value, int visibleLength) {
        if (!StringUtils.hasText(value)) {
            return "(empty)";
        }

        int length = Math.min(visibleLength, value.length());
        return value.substring(0, length) + "***";
    }
}
