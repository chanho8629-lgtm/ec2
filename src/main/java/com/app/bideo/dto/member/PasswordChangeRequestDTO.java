package com.app.bideo.dto.member;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordChangeRequestDTO {
    private String currentPassword;
    private String newPassword;
    private String confirmPassword;
}
