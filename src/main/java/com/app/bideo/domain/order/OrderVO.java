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
    private Integer originalPrice;
    private Integer discountAmount;
    private Integer feeAmount;
    private Integer totalPrice;
    private Integer depositAmount;
    private String depositStatus;
    private LocalDateTime balanceDueAt;
    private LocalDateTime orderedAt;
    private LocalDateTime paidAt;
    private LocalDateTime completedAt;
    private LocalDateTime refundedAt;
    private String status;
}
