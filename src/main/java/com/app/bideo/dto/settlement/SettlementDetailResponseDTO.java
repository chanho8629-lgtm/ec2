package com.app.bideo.dto.settlement;

import com.app.bideo.domain.settlement.SettlementDeductionVO;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementDetailResponseDTO {
    private Long id;
    private Long paymentId;
    private String paymentCode;
    private Long memberId;
    private String memberNickname;
    private Integer preTaxAmount;
    private Integer totalDeduction;
    private Integer netAmount;
    private Integer effectiveTaxRate;
    private String status;
    private List<SettlementDeductionVO> deductions;
    private LocalDateTime approvedAt;
    private LocalDateTime paidAt;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
}
