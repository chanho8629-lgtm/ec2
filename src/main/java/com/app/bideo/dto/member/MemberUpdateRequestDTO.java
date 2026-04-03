package com.app.bideo.dto.member;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberUpdateRequestDTO {
    private String nickname;
    private String bio;
    private String profileImage;
    private String realName;
    private String phoneNumber;
    private List<Long> tagIds;
}
