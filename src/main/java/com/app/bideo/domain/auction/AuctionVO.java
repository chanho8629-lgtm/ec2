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
    private Integer askingPrice;
    private Integer startingPrice;
    private Integer estimateLow;
    private Integer estimateHigh;
    private Integer bidIncrement;
    private Integer currentPrice;
    private Integer bidCount;
    private Double feeRate;
    private Integer feeAmount;
    private Integer settlementAmount;
    private Integer deadlineHours;
    private LocalDateTime startedAt;
    private LocalDateTime closingAt;
    private Double cancelThreshold;
    private String status;
    private Long winnerId;
    private Integer finalPrice;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
}
