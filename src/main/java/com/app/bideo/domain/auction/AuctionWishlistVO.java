package com.app.bideo.domain.auction;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionWishlistVO {
    private Long id;
    private Long auctionId;
    private Long memberId;
    private LocalDateTime createdDatetime;
}
