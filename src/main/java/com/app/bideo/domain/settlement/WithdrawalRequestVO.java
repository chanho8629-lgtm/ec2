package com.app.bideo.domain.settlement;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawalRequestVO {
    private Long id;
    private String withdrawalCode;
    private Long memberId;
    private Long settlementId;
    private Integer requestedAmount;
    private Integer fee;
    private Integer netAmount;
    private String status;
    private Long adminId;
    private String rejectedReason;
    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime paidAt;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
}
