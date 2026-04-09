package com.app.bideo.dto.dashboard;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DashboardSummaryRawDTO {
    private Long totalViews;
    private Integer activeAuctionCount;
    private Integer soldAuctionCount;
    private Integer hostedAuctionCount;
    private Long totalAuctionTransactionAmount;
    private Integer participatingContestCount;
    private Integer activeContestCount;
    private Integer awardedContestCount;
    private Long totalContestPrizeAmount;
    private Long pendingPaymentAmount;
    private Integer closingSoonAuctionCount;
    private Integer pendingPaymentCount;
    private Integer completedWithdrawalCount;
    private Long plannedSettlementAmount;
    private Long totalPaymentAmount;
    private Integer paymentSuccessCount;
    private Integer paymentFailureCount;
    private Integer pendingSettlementCount;
    private Integer unreadNotificationCount;
}
