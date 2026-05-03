package com.app.bideo.dto.admin;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminWithdrawalDetailResponseDTO {
    private Long id;
    private String withdrawalCode;
    private String artistNickname;
    private String artistEmail;
    private Long artistId;
    private String artistStatus;
    private Long totalTransactionAmount;
    private String withdrawalHistory;
    private String bankName;
    private String accountNumber;
    private String accountHolder;
    private Boolean accountVerified;
    private Long requestAmount;
    private Long commissionAmount;
    private Long netAmount;
    private Long currentBalance;
    private Long balanceAfter;
    private LocalDateTime requestedAt;
    private String approver;
    private LocalDateTime approvedAt;
    private String rejectedReason;
    private String status;
}
