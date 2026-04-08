package com.app.bideo.dto.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminWithdrawalListResponseDTO {
    private Long id;
    private String withdrawalCode;
    private String artistName;
    private Integer requestedAmount;
    private Integer netAmount;
    private String bankName;
    private String requestedAt;
    private Integer remainingBalance;
    private String status;
}
