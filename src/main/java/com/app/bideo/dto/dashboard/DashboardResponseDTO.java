package com.app.bideo.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DashboardResponseDTO {
    private String creatorName;
    private String totalViewsText;
    private String activeAuctionsText;
    private String participatingContestsText;
    private String pendingPaymentsText;
    private String overviewTitle;
    private String overviewDescription;
    private String attentionCountText;
    private Map<String, DashboardMetricSeriesDTO> analyticsMetrics;
    private List<DashboardSummaryTableDTO> summaryTables;
    private DashboardChartDTO reactionChart;
    private List<DashboardListItemDTO> myAuctions;
    private List<DashboardListItemDTO> participatingAuctions;
    private List<DashboardListItemDTO> bookmarkedWorks;
    private List<DashboardListItemDTO> ownedWorks;
    private List<DashboardListItemDTO> hostedContests;
    private List<DashboardListItemDTO> participatingContests;
    private List<DashboardListItemDTO> galleries;
    private List<DashboardListItemDTO> soldWorks;
    private List<DashboardListItemDTO> storedWorks;
    private List<DashboardListItemDTO> paymentHistory;
    private List<DashboardListItemDTO> settlements;
    private List<DashboardListItemDTO> wishlistNotifications;
}
