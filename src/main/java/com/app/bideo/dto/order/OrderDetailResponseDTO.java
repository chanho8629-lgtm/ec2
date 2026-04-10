package com.app.bideo.dto.order;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailResponseDTO {
    private Long id;
    private String orderCode;
    private Long buyerId;
    private String buyerNickname;
    private Long sellerId;
    private String sellerNickname;
    private Long workId;
    private String workTitle;
    private Long auctionId;
    private String orderType;
    private String licenseType;
    private Long originalPrice;
    private Long discountAmount;
    private Long feeAmount;
    private Long totalPrice;
    private Long depositAmount;
    private String depositStatus;
    private String status;
    private LocalDateTime orderedAt;
    private LocalDateTime paidAt;
    private LocalDateTime completedAt;
}
