package com.app.bideo.domain.settlement;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementVO {
    private Long id;
    private Long paymentId;
    private Long memberId;
    private Long preTaxAmount;
    private Long totalDeduction;
    private Long netAmount;
    private Integer effectiveTaxRate;
    private String status;
    private LocalDateTime approvedAt;
    private LocalDateTime paidAt;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
}
