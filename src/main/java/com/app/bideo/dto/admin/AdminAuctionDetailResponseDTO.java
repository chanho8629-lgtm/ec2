package com.app.bideo.dto.admin;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAuctionDetailResponseDTO {
    private Long id;
    private String auctionCode;
    private Long startPrice;
    private Long bidUnit;
    private Long winningPrice;
    private Integer bidCount;
    private Integer participantCount;
    private String startAt;
    private String endAt;
    private String artworkTitle;
    private String artistNickname;
    private String artworkCategory;
    private Long winnerId;
    private String winnerNickname;
    private BigDecimal commissionRate;
    private Long commissionAmount;
    private Long settlementAmount;
    private String status;
    private String paymentStatus;
    private String settlementStatus;
}
