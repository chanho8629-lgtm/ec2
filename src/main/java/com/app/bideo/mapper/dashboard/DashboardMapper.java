package com.app.bideo.mapper.dashboard;

import com.app.bideo.dto.dashboard.DashboardDailyMetricPointDTO;
import com.app.bideo.dto.dashboard.DashboardListItemDTO;
import com.app.bideo.dto.dashboard.DashboardNoticeSummaryDTO;
import com.app.bideo.dto.dashboard.DashboardReactionPointDTO;
import com.app.bideo.dto.dashboard.DashboardSummaryRawDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface DashboardMapper {

    // 크리에이터 이름 조회
    String selectCreatorName(@Param("memberId") Long memberId);

    // 대시보드 요약 조회
    DashboardSummaryRawDTO selectDashboardSummary(@Param("memberId") Long memberId);

    // 반응 추이 조회
    List<DashboardReactionPointDTO> selectReactionTrend(@Param("memberId") Long memberId);

    // 내 경매 목록 조회
    List<DashboardListItemDTO> selectMyAuctionItems(@Param("memberId") Long memberId);

    // 참여 경매 목록 조회
    List<DashboardListItemDTO> selectParticipatingAuctionItems(@Param("memberId") Long memberId);

    // 찜한 작품 목록 조회
    List<DashboardListItemDTO> selectBookmarkedWorkItems(@Param("memberId") Long memberId);

    // 내 작품 목록 조회
    List<DashboardListItemDTO> selectOwnedWorkItems(@Param("memberId") Long memberId);

    // 주최 공모전 목록 조회
    List<DashboardListItemDTO> selectHostedContestItems(@Param("memberId") Long memberId);

    // 참여 공모전 목록 조회
    List<DashboardListItemDTO> selectParticipatingContestItems(@Param("memberId") Long memberId);

    // 예술관 목록 조회
    List<DashboardListItemDTO> selectGalleryItems(@Param("memberId") Long memberId);

    // 판매 작품 목록 조회
    List<DashboardListItemDTO> selectSoldWorkItems(@Param("memberId") Long memberId);

    // 구매 작품 목록 조회
    List<DashboardListItemDTO> selectPurchasedWorkItems(@Param("memberId") Long memberId);

    // 보관 작품 목록 조회
    List<DashboardListItemDTO> selectStoredWorkItems(@Param("memberId") Long memberId);

    // 결제 내역 조회
    List<DashboardListItemDTO> selectPaymentHistoryItems(@Param("memberId") Long memberId);

    // 정산 내역 조회
    List<DashboardListItemDTO> selectSettlementItems(@Param("memberId") Long memberId);

    // 알림 요약 조회
    DashboardNoticeSummaryDTO selectNoticeSummary(@Param("memberId") Long memberId);

    // 찜한 작품 수 조회
    Integer selectBookmarkedWorkCount(@Param("memberId") Long memberId);

    // 등록 작품 수 조회
    Integer selectOwnedWorkCount(@Param("memberId") Long memberId);

    // 등록 예술관 수 조회
    Integer selectOwnedGalleryCount(@Param("memberId") Long memberId);

    // 주최 공모전 수 조회
    Integer selectHostedContestCount(@Param("memberId") Long memberId);

    // 등록된 카드 수 조회
    Integer selectRegisteredCardCount(@Param("memberId") Long memberId);

    // 찜한 작품 수 추이 조회
    List<DashboardDailyMetricPointDTO> selectDailyBookmarkedWorkCounts(@Param("memberId") Long memberId,
                                                                       @Param("startDate") LocalDate startDate,
                                                                       @Param("endDate") LocalDate endDate);

    // 작품 등록 수 추이 조회
    List<DashboardDailyMetricPointDTO> selectDailyCreatedWorkCounts(@Param("memberId") Long memberId,
                                                                    @Param("startDate") LocalDate startDate,
                                                                    @Param("endDate") LocalDate endDate);

    // 예술관 등록 수 추이 조회
    List<DashboardDailyMetricPointDTO> selectDailyCreatedGalleryCounts(@Param("memberId") Long memberId,
                                                                       @Param("startDate") LocalDate startDate,
                                                                       @Param("endDate") LocalDate endDate);
}
