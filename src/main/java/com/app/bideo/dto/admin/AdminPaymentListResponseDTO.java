package com.app.bideo.dto.admin;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminPaymentListResponseDTO {
    private Long id;
    private String orderNumber;
    private String payerName;
    private String artistNickname;
    private String type;
    private String artworkTitle;
    private Long amount;
    private LocalDateTime paidAt;
    private String status;
}
