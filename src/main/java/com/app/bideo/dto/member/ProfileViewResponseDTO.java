package com.app.bideo.dto.member;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileViewResponseDTO {
    private Long id;
    private String nickname;
    private String realName;
    private String bio;
    private String profileImage;
    private String bannerImage;
    private Boolean creatorVerified;
    private Boolean sellerVerified;
    private String creatorTier;
    private Integer followerCount;
    private Integer followingCount;
    private Integer galleryCount;
    private Integer workCount;
    private Boolean isOwner;
    private Boolean isFollowing;
    private Boolean isBlocked;
    private String shareUrl;
    private List<MemberBadgeResponseDTO> profileBadges;
}
