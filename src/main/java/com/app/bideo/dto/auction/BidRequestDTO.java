package com.app.bideo.dto.auction;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidRequestDTO {
    private Long auctionId;
    private Integer bidPrice;
}
