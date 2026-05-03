package com.app.bideo.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminMemberDetailResponseDTO {
    private Long id;
    private String email;
    private String nickname;
    private String realName;
    private LocalDate birthDate;
    private String bio;
    private String profileImage;
    private String role;
    private String status;
    private Boolean creatorVerified;
    private Boolean sellerVerified;
    private String creatorTier;
    private Integer followerCount;
    private Integer followingCount;
    private Integer galleryCount;
    private String phone;
    private LocalDateTime lastLoginAt;
    private LocalDateTime lastActivityAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedDatetime;
    private String socialProvider;
    private String memberType;
    private Boolean emailVerified;
    private Boolean phoneVerified;
    private Integer reportCount;
    private Integer failedPaymentCount;
    private Integer workCount;
    private Integer auctionWinCount;
    private Integer soldCount;
    private Long totalTransactionAmount;
    private Integer pendingWithdrawalCount;
    private String lastTransactionDate;
    private Integer refundCount;
    private Integer suspensionCount;
}
