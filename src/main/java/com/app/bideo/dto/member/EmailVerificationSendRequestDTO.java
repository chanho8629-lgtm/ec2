package com.app.bideo.dto.member;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailVerificationSendRequestDTO {
    private String email;
}
