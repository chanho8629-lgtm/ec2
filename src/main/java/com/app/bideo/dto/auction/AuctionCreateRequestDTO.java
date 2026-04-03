package com.app.bideo.dto.auction;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionCreateRequestDTO {
    private Long workId;
    private Integer askingPrice;
    private Integer startingPrice;
    private Integer estimateLow;
    private Integer estimateHigh;
    private Integer bidIncrement;
    private Integer deadlineHours;
}
