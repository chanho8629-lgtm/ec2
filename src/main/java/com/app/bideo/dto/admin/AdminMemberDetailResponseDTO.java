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
    private String phoneNumber;
    private LocalDateTime lastLoginDatetime;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
    private String oauthProvider;
    private Integer workCount;
    private Integer auctionParticipateCount;
    private Integer soldCount;
    private Integer totalTradeAmount;
    private Integer pendingWithdrawalCount;
    private String lastTransactionDate;
    private Integer refundCount;
    private Integer restrictionHistoryCount;
}
