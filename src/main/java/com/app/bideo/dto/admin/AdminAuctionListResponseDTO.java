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
    private String workTitle;
    private String artistName;
    private String winnerName;
    private Integer startingPrice;
    private Integer finalPrice;
    private Integer bidCount;
    private String closingAt;
    private String status;
}
