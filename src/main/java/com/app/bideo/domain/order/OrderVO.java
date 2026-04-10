package com.app.bideo.domain.order;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderVO {
    private Long id;
    private String orderCode;
    private Long buyerId;
    private Long sellerId;
    private Long workId;
    private Long auctionId;
    private String orderType;
    private String licenseType;
    private Long originalPrice;
    private Long discountAmount;
    private Long feeAmount;
    private Long totalPrice;
    private Long depositAmount;
    private String depositStatus;
    private LocalDateTime balanceDueAt;
    private LocalDateTime orderedAt;
    private LocalDateTime paidAt;
    private LocalDateTime completedAt;
    private LocalDateTime refundedAt;
    private String status;
}
