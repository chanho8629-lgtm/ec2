package com.app.bideo.dto.auction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidBroadcastDTO {
    private Long auctionId;
    private Long memberId;
    private String memberNickname;
    private Integer bidPrice;
    private Integer currentPrice;
    private Integer bidCount;
    private Integer nextMinBid;      // currentPrice + bidIncrement
    private LocalDateTime createdDatetime;
}
