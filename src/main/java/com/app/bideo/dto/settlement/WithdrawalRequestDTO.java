package com.app.bideo.dto.settlement;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawalRequestDTO {
    private Long settlementId;
    private Integer requestedAmount;
}
