package com.app.bideo.dto.dashboard;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class DashboardResponseDTO {
    private String creatorName;
    private String totalViewsText;
    private String activeAuctionsText;
    private String participatingContestsText;
    private String pendingPaymentsText;
    private String overviewTitle;
    private String overviewDescription;
    private String attentionCountText;
    private DashboardChartDTO reactionChart;
    private List<DashboardListItemDTO> myAuctions;
    private List<DashboardListItemDTO> participatingAuctions;
    private List<DashboardListItemDTO> ownedWorks;
    private List<DashboardListItemDTO> hostedContests;
    private List<DashboardListItemDTO> participatingContests;
    private List<DashboardListItemDTO> galleries;
    private List<DashboardListItemDTO> paymentHistory;
    private List<DashboardListItemDTO> settlements;
    private List<DashboardListItemDTO> wishlistNotifications;
}
