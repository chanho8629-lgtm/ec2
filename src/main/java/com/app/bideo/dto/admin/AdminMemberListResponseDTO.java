package com.app.bideo.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminMemberListResponseDTO {
    private Long id;
    private String email;
    private String nickname;
    private String realName;
    private String role;
    private String status;
    private Boolean creatorVerified;
    private String creatorTier;
    private Integer followerCount;
    private LocalDateTime createdAt;
    private String memberType;
    private Integer reportCount;
    private Integer transactionCount;
}
