package com.app.bideo.dto.settlement;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawalResponseDTO {
    private Long id;
    private String withdrawalCode;
    private Long requestedAmount;
    private Long fee;
    private Long netAmount;
    private String status;
    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime paidAt;
}
