package com.app.bideo.dto.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminPaymentDetailResponseDTO {
    private Long id;
    private String orderCode;
    private String workTitle;
    private String sellerName;
    private Long sellerId;
    private String orderType;
    private Long totalPrice;
    private Long totalFee;
    private Long settlementAmount;
    private String buyerName;
    private String buyerEmail;
    private String payMethod;
    private String cardNumber;
    private String paidAt;
    private String paymentCode;
    private String status;
}
