package com.app.bideo.dto.member;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhoneVerificationSendRequestDTO {
    private String phoneNumber;
}
