package com.app.bideo.dto.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAuctionListResponseDTO {
    private Long id;
    private String auctionCode;
    private String artworkTitle;
    private String artistNickname;
    private Long winnerId;
    private String winnerNickname;
    private Long startPrice;
    private Long winningPrice;
    private Integer bidCount;
    private String endAt;
    private String status;
}
