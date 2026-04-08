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
    private Integer startingPrice;
    private Integer bidIncrement;
    private Integer finalPrice;
    private Integer bidCount;
    private Integer participantCount;
    private String startedAt;
    private String closingAt;
    private String workTitle;
    private String artistName;
    private String category;
    private String winnerName;
    private BigDecimal feeRate;
    private Integer feeAmount;
    private Integer settlementAmount;
    private String status;
    private String paymentStatus;
    private String settlementStatus;
}
