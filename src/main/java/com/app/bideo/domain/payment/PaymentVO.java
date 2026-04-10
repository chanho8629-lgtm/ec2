package com.app.bideo.domain.payment;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentVO {
    private Long id;
    private String paymentCode;
    private String orderCode;
    private Long buyerId;
    private Long sellerId;
    private Long workId;
    private Long auctionId;
    private Integer originalAmount;
    private Integer totalPrice;
    private Integer totalFee;
    private String paymentPurpose;
    private String payMethod;
    private Long cardId;
    private String status;
    private LocalDateTime paidAt;
    private LocalDateTime refundedAt;
    private LocalDateTime createdDatetime;
}
