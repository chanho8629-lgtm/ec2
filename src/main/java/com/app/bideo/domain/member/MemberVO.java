package com.app.bideo.domain.member;

import com.app.bideo.common.enumeration.MemberRole;
import com.app.bideo.common.enumeration.MemberStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberVO {
    private Long id;
    private String email;
    private String password;
    private String nickname;
    private String realName;
    private LocalDate birthDate;
    private String bio;
    private String profileImage;
    private MemberRole role;
    private Boolean creatorVerified;
    private Boolean sellerVerified;
    private String creatorTier;
    private Integer followerCount;
    private Integer followingCount;
    private Integer galleryCount;
    private String phoneNumber;
    private LocalDateTime lastLoginDatetime;
    private MemberStatus status;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
    private LocalDateTime deletedDatetime;
}
