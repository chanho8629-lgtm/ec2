package com.app.bideo.dto.member;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhoneVerificationConfirmRequestDTO {
    private String phoneNumber;
    private String verificationCode;
}
