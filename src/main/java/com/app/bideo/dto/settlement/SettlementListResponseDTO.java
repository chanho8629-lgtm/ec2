package com.app.bideo.dto.settlement;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementListResponseDTO {
    private Long id;
    private String paymentCode;
    private Long netAmount;
    private String status;
    private LocalDateTime createdDatetime;
}
