package com.app.bideo.dto.payment;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BootpayConfirmRequestDTO {
    private Long paymentId;
    private String receiptId;
}
