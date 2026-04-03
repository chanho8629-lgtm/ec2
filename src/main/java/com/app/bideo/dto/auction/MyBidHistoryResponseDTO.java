package com.app.bideo.dto.auction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyBidHistoryResponseDTO {
    private Long auctionId;
    private Long workId;
    private String workTitle;
    private String workThumbnail;
    private Long sellerId;
    private String sellerNickname;
    private Integer myBidPrice;
    private Integer currentPrice;
    private Integer finalPrice;
    private String status;
    private Boolean isWinning;
    private LocalDateTime closingAt;
    private LocalDateTime lastBidAt;
}
