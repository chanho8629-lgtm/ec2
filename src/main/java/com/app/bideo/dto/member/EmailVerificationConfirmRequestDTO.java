package com.app.bideo.dto.member;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailVerificationConfirmRequestDTO {
    private String email;
    private String verificationCode;
}
