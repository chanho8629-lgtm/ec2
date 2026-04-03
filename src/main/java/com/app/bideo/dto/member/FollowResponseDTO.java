package com.app.bideo.dto.member;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowResponseDTO {
    private Long id;
    private Long memberId;
    private String nickname;
    private String profileImage;
    private Boolean creatorVerified;
    private Boolean isFollowing;
    private LocalDateTime createdDatetime;
}
