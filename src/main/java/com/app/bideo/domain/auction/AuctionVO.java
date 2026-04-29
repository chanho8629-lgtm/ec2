package com.app.bideo.domain.auction;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionVO {
    private Long id;
    private Long workId;
    private Long sellerId;
    private Long askingPrice;
    private Long startingPrice;
    private Long estimateLow;
    private Long estimateHigh;
    private Long bidIncrement;
    private Long currentPrice;
    private Integer bidCount;
    private Double feeRate;
    private Long feeAmount;
    private Long settlementAmount;
    private Integer deadlineHours;
    private LocalDateTime startedAt;
    private LocalDateTime closingAt;
    private Double cancelThreshold;
    private String status;
    private Long winnerId;
    private Long finalPrice;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
}
