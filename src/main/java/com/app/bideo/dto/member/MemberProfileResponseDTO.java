package com.app.bideo.dto.member;

import com.app.bideo.dto.common.TagResponseDTO;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberProfileResponseDTO {
    private Long id;
    private String email;
    private String nickname;
    private String realName;
    private LocalDate birthDate;
    private String bio;
    private String profileImage;
    private String role;
    private Boolean creatorVerified;
    private Boolean sellerVerified;
    private String creatorTier;
    private Integer followerCount;
    private Integer followingCount;
    private Integer galleryCount;
    private String phoneNumber;
    private String status;
    private List<TagResponseDTO> tags;
    private List<MemberBadgeResponseDTO> badges;
    private Boolean isFollowing;
    private LocalDateTime createdDatetime;
}
