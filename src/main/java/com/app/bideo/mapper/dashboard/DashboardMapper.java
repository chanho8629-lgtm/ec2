package com.app.bideo.mapper.dashboard;

import com.app.bideo.dto.dashboard.DashboardListItemDTO;
import com.app.bideo.dto.dashboard.DashboardNoticeSummaryDTO;
import com.app.bideo.dto.dashboard.DashboardReactionPointDTO;
import com.app.bideo.dto.dashboard.DashboardSummaryRawDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface DashboardMapper {

    String selectCreatorName(@Param("memberId") Long memberId);

    DashboardSummaryRawDTO selectDashboardSummary(@Param("memberId") Long memberId);

    List<DashboardReactionPointDTO> selectReactionTrend(@Param("memberId") Long memberId);

    List<DashboardListItemDTO> selectMyAuctionItems(@Param("memberId") Long memberId);

    List<DashboardListItemDTO> selectParticipatingAuctionItems(@Param("memberId") Long memberId);

    List<DashboardListItemDTO> selectOwnedWorkItems(@Param("memberId") Long memberId);

    List<DashboardListItemDTO> selectHostedContestItems(@Param("memberId") Long memberId);

    List<DashboardListItemDTO> selectParticipatingContestItems(@Param("memberId") Long memberId);

    List<DashboardListItemDTO> selectGalleryItems(@Param("memberId") Long memberId);

    List<DashboardListItemDTO> selectPaymentHistoryItems(@Param("memberId") Long memberId);

    List<DashboardListItemDTO> selectSettlementItems(@Param("memberId") Long memberId);

    DashboardNoticeSummaryDTO selectNoticeSummary(@Param("memberId") Long memberId);
}
