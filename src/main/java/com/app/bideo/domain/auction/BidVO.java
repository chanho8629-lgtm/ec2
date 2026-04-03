package com.app.bideo.domain.auction;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidVO {
    private Long id;
    private Long auctionId;
    private Long memberId;
    private Integer bidPrice;
    private Boolean isWinning;
    private LocalDateTime createdDatetime;
}
