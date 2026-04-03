package com.app.bideo.dto.auction;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionDetailResponseDTO {
    private Long id;
    private Long workId;
    private String workTitle;
    private String workThumbnail;
    private Long sellerId;
    private String sellerNickname;
    private Integer askingPrice;
    private Integer startingPrice;
    private Integer currentPrice;
    private Integer bidCount;
    private Integer bidIncrement;
    private Integer estimateLow;
    private Integer estimateHigh;
    private Double feeRate;
    private Integer deadlineHours;
    private LocalDateTime startedAt;
    private LocalDateTime closingAt;
    private String status;
    private Long winnerId;
    private Integer finalPrice;
    private Boolean isWishlisted;
    private LocalDateTime createdDatetime;
}
