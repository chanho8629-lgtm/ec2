package com.app.bideo.dto.payment;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDTO {
    private Long id;
    private String paymentCode;
    private String orderCode;
    private Integer totalPrice;
    private Integer totalFee;
    private String paymentPurpose;
    private String payMethod;
    private String pgReceiptId;
    private String status;
    private LocalDateTime paidAt;
    private LocalDateTime createdDatetime;
}
