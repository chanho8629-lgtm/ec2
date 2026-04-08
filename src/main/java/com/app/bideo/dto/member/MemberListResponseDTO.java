package com.app.bideo.dto.member;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberListResponseDTO {
    private Long id;
    private String nickname;
    private String profileImage;
    private String bio;
    private Boolean creatorVerified;
    private String creatorTier;
    private Integer followerCount;
    private Boolean isFollowing;
}
