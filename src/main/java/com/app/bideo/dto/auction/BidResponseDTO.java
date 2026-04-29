package com.app.bideo.dto.auction;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidResponseDTO {
    private Long id;
    private Long auctionId;
    private Long memberId;
    private String memberNickname;
    private Long bidPrice;
    private Boolean isWinning;
    private LocalDateTime createdDatetime;
}
