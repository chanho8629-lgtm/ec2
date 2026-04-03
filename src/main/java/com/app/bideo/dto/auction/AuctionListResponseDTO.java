package com.app.bideo.dto.auction;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionListResponseDTO {
    private Long id;
    private String workTitle;
    private String workThumbnail;
    private String sellerNickname;
    private Integer currentPrice;
    private Integer bidCount;
    private LocalDateTime closingAt;
    private String status;
}
