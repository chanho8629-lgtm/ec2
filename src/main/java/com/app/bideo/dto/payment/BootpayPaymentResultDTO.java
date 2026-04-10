package com.app.bideo.dto.payment;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BootpayPaymentResultDTO {
    private String receiptId;
    private String method;
    private String status;
}
