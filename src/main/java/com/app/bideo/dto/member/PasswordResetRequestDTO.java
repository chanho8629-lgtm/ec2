package com.app.bideo.dto.member;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetRequestDTO {
    private String email;
    private String verificationCode;
    private String newPassword;
    private String confirmPassword;
}
