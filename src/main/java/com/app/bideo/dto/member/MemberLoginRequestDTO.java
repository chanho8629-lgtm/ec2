package com.app.bideo.dto.member;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberLoginRequestDTO {
    private String email;
    private String password;
}
