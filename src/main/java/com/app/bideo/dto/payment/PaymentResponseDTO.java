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
    private Long workId;
    private Long auctionId;
    private Long originalAmount;
    private Long totalPrice;
    private Long totalFee;
    private String paymentPurpose;
    private String payMethod;
    private String pgReceiptId;
    private String status;
    private String workTitle;
    private String workThumbnail;
    private String sellerNickname;
    private String licenseType;
    private LocalDateTime paidAt;
    private LocalDateTime createdDatetime;
}
