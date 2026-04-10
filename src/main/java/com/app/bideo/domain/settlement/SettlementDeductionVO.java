package com.app.bideo.domain.settlement;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementDeductionVO {
    private Long id;
    private Long settlementId;
    private String deductionName;
    private Long amount;
    private Integer sortOrder;
}
