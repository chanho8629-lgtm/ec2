package com.app.bideo.dto.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminWithdrawalDetailResponseDTO {
    private Long id;
    private String withdrawalCode;
    private String artistName;
    private String artistEmail;
    private Long artistId;
    private String memberStatus;
    private Integer totalSalesAmount;
    private Integer withdrawalHistoryCount;
    private Integer withdrawalHistoryTotal;
    private String bankName;
    private String accountNumber;
    private String accountHolder;
    private Integer requestedAmount;
    private Integer fee;
    private Integer netAmount;
    private Integer currentBalance;
    private Integer afterBalance;
    private String requestedAt;
    private String approverName;
    private String approvedAt;
    private String rejectedReason;
    private String status;
}
