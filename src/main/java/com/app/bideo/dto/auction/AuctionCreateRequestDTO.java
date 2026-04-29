package com.app.bideo.dto.auction;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionCreateRequestDTO {
    private Long workId;
    private Long askingPrice;
    private Long startingPrice;
    private Long estimateLow;
    private Long estimateHigh;
    private Long bidIncrement;
    private Integer deadlineHours;
}
