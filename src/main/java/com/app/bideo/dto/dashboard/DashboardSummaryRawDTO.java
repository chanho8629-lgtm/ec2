package com.app.bideo.dto.dashboard;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DashboardSummaryRawDTO {
    private Long totalViews;
    private Integer activeAuctionCount;
    private Integer participatingContestCount;
    private Long pendingPaymentAmount;
    private Integer closingSoonAuctionCount;
    private Integer pendingPaymentCount;
    private Integer pendingSettlementCount;
    private Integer unreadNotificationCount;
}
