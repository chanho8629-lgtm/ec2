package com.app.bideo.dto.admin;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminPaymentDetailResponseDTO {
    private Long id;
    private String orderNumber;
    private String artworkTitle;
    private String artistNickname;
    private Long sellerId;
    private String type;
    private Long price;
    private Long commissionAmount;
    private Long settlementAmount;
    private Long totalAmount;
    private String buyerName;
    private String buyerEmail;
    private String buyerPhone;
    private String paymentMethod;
    private String cardNumber;
    private LocalDateTime paidAt;
    private String approvalNumber;
    private String status;
}
