package com.app.bideo.dto.member;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberSignupRequestDTO {
    private String email;
    private String password;
    private String nickname;
    private String realName;
    private LocalDate birthDate;
    private String phoneNumber;
    private List<Long> tagIds;
}
