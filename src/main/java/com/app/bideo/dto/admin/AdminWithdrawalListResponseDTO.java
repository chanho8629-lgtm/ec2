package com.app.bideo.dto.admin;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminWithdrawalListResponseDTO {
    private Long id;
    private String withdrawalCode;
    private String artistName;
    private Long requestAmount;
    private Long actualAmount;
    private String bankName;
    private LocalDateTime requestedAt;
    private Long remainingBalance;
    private String status;
}
