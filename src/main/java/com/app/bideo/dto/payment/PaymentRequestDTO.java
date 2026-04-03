package com.app.bideo.dto.payment;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequestDTO {
    private String orderCode;
    private String payMethod;
    private Long cardId;
    private String paymentPurpose;
}
