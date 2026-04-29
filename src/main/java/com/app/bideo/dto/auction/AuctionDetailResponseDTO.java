package com.app.bideo.dto.auction;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

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
    private Long askingPrice;
    private Long startingPrice;
    private Long currentPrice;
    private Long bidCount;
    private Long bidIncrement;
    private Long estimateLow;
    private Long estimateHigh;
    private Double feeRate;
    private Integer deadlineHours;
    private LocalDateTime startedAt;
    private LocalDateTime closingAt;
    private String status;
    private Long winnerId;
    private Long finalPrice;
    private Boolean isWishlisted;
    private LocalDateTime createdDatetime;

    private Long loginMemberId;

    private List<BidResponseDTO> bids;
}
