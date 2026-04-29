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
    private Long bidPrice;
    private Long currentPrice;
    private Integer bidCount;
    private Long nextMinBid;      // currentPrice + bidIncrement
    private LocalDateTime createdDatetime;
}
