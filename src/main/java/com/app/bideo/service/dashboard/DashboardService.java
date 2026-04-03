package com.app.bideo.service.dashboard;

import com.app.bideo.dto.dashboard.DashboardChartDTO;
import com.app.bideo.dto.dashboard.DashboardChartLabelDTO;
import com.app.bideo.dto.dashboard.DashboardChartPointDTO;
import com.app.bideo.dto.dashboard.DashboardListItemDTO;
import com.app.bideo.dto.dashboard.DashboardNoticeSummaryDTO;
import com.app.bideo.dto.dashboard.DashboardReactionPointDTO;
import com.app.bideo.dto.dashboard.DashboardResponseDTO;
import com.app.bideo.dto.dashboard.DashboardSummaryRawDTO;
import com.app.bideo.mapper.dashboard.DashboardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private static final int[] CHART_X_POSITIONS = {60, 145, 230, 315, 400, 485, 570};
    private static final int CHART_MIN_Y = 52;
    private static final int CHART_MAX_Y = 162;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy.MM.dd");

    private final DashboardMapper dashboardMapper;

    // 대시보드 전역 응답을 구성하고 비어 있는 영역에는 기본 문구를 채운다.
    public DashboardResponseDTO getDashboard(Long memberId) {
        String creatorName = defaultIfBlank(dashboardMapper.selectCreatorName(memberId), "크리에이터");
        DashboardSummaryRawDTO summary = dashboardMapper.selectDashboardSummary(memberId);
        DashboardNoticeSummaryDTO noticeSummary = dashboardMapper.selectNoticeSummary(memberId);
        if (summary == null) {
            summary = new DashboardSummaryRawDTO();
        }
        if (noticeSummary == null) {
            noticeSummary = new DashboardNoticeSummaryDTO();
        }

        return DashboardResponseDTO.builder()
                .creatorName(creatorName)
                .totalViewsText(formatCompactNumber(nullSafe(summary.getTotalViews())))
                .activeAuctionsText(formatTwoDigits(nullSafe(summary.getActiveAuctionCount())))
                .participatingContestsText(formatTwoDigits(nullSafe(summary.getParticipatingContestCount())))
                .pendingPaymentsText(formatCurrencyCompact(nullSafe(summary.getPendingPaymentAmount())))
                .overviewTitle("오늘의 운영 현황을 한 화면에서 확인하세요.")
                .overviewDescription(creatorName + "님의 작품 반응, 경매 진행 상태, 공모전 일정, 결제 예정 내역과 정산 현황을 대시보드에서 바로 확인할 수 있습니다.")
                .attentionCountText(nullSafe(summary.getClosingSoonAuctionCount())
                        + nullSafe(summary.getPendingPaymentCount())
                        + nullSafe(summary.getPendingSettlementCount())
                        + nullSafe(summary.getUnreadNotificationCount()) + "건")
                .reactionChart(buildChart(dashboardMapper.selectReactionTrend(memberId)))
                .myAuctions(withFallback(dashboardMapper.selectMyAuctionItems(memberId), "등록된 경매가 없습니다.", "작품을 경매에 등록하면 진행 상황이 이곳에 표시됩니다."))
                .participatingAuctions(withFallback(dashboardMapper.selectParticipatingAuctionItems(memberId), "참여 중인 경매가 없습니다.", "입찰한 경매가 생기면 현재 상태가 이곳에 표시됩니다."))
                .ownedWorks(withFallback(dashboardMapper.selectOwnedWorkItems(memberId), "등록된 작품이 없습니다.", "작품 또는 모음집을 등록하면 대표 항목이 이곳에 표시됩니다."))
                .hostedContests(withFallback(dashboardMapper.selectHostedContestItems(memberId), "주최한 공모전이 없습니다.", "공모전을 등록하면 접수 현황이 이곳에 표시됩니다."))
                .participatingContests(withFallback(dashboardMapper.selectParticipatingContestItems(memberId), "참여 중인 공모전이 없습니다.", "출품한 공모전이 생기면 진행 상태가 이곳에 표시됩니다."))
                .galleries(withFallback(dashboardMapper.selectGalleryItems(memberId), "예술관이 없습니다.", "예술관을 만들면 전시 상태가 이곳에 표시됩니다."))
                .paymentHistory(withFallback(dashboardMapper.selectPaymentHistoryItems(memberId), "결제 이력이 없습니다.", "구매 또는 판매 결제가 발생하면 이곳에 표시됩니다."))
                .settlements(withFallback(dashboardMapper.selectSettlementItems(memberId), "정산 이력이 없습니다.", "정산 대상 결제가 생기면 이곳에 표시됩니다."))
                .wishlistNotifications(buildWishlistNotifications(noticeSummary))
                .build();
    }

    // 최근 7일 반응 데이터를 SVG 차트 모델로 변환한다.
    private DashboardChartDTO buildChart(List<DashboardReactionPointDTO> rawPoints) {
        List<DashboardReactionPointDTO> points = ensureSevenDays(rawPoints);
        int maxValue = 1;
        for (DashboardReactionPointDTO point : points) {
            maxValue = Math.max(maxValue, Math.max(nullSafe(point.getViewCount()), Math.max(nullSafe(point.getLikeCount()), nullSafe(point.getSaveCount()))));
        }

        List<DashboardChartPointDTO> viewPoints = mapChartPoints(points, maxValue, SeriesType.VIEW);
        List<DashboardChartPointDTO> likePoints = mapChartPoints(points, maxValue, SeriesType.LIKE);
        List<DashboardChartPointDTO> savePoints = mapChartPoints(points, maxValue, SeriesType.SAVE);
        List<DashboardChartLabelDTO> labels = new ArrayList<>();

        for (int i = 0; i < points.size(); i++) {
            labels.add(new DashboardChartLabelDTO(
                    CHART_X_POSITIONS[i],
                    points.get(i).getDay().getDayOfWeek().getDisplayName(TextStyle.NARROW, Locale.KOREAN)
            ));
        }

        return DashboardChartDTO.builder()
                .viewPolylinePoints(toPolyline(viewPoints))
                .likePolylinePoints(toPolyline(likePoints))
                .savePolylinePoints(toPolyline(savePoints))
                .viewPoints(viewPoints)
                .likePoints(likePoints)
                .savePoints(savePoints)
                .labels(labels)
                .build();
    }

    // 누락된 날짜가 있어도 차트가 항상 7일치를 가지도록 빈 데이터를 채운다.
    private List<DashboardReactionPointDTO> ensureSevenDays(List<DashboardReactionPointDTO> rawPoints) {
        List<DashboardReactionPointDTO> result = new ArrayList<>();
        LocalDate start = LocalDate.now().minusDays(6);

        for (int i = 0; i < 7; i++) {
            LocalDate day = start.plusDays(i);
            DashboardReactionPointDTO matched = rawPoints.stream()
                    .filter(point -> day.equals(point.getDay()))
                    .findFirst()
                    .orElseGet(() -> {
                        DashboardReactionPointDTO empty = new DashboardReactionPointDTO();
                        empty.setDay(day);
                        empty.setViewCount(0);
                        empty.setLikeCount(0);
                        empty.setSaveCount(0);
                        return empty;
                    });
            result.add(matched);
        }

        return result;
    }

    // 시리즈별 값을 차트 좌표로 정규화한다.
    private List<DashboardChartPointDTO> mapChartPoints(List<DashboardReactionPointDTO> points, int maxValue, SeriesType seriesType) {
        List<DashboardChartPointDTO> result = new ArrayList<>();

        for (int i = 0; i < points.size(); i++) {
            int value = switch (seriesType) {
                case VIEW -> nullSafe(points.get(i).getViewCount());
                case LIKE -> nullSafe(points.get(i).getLikeCount());
                case SAVE -> nullSafe(points.get(i).getSaveCount());
            };

            int y = CHART_MAX_Y - (int) Math.round((double) value / maxValue * (CHART_MAX_Y - CHART_MIN_Y));
            result.add(new DashboardChartPointDTO(CHART_X_POSITIONS[i], Math.max(CHART_MIN_Y, Math.min(CHART_MAX_Y, y))));
        }

        return result;
    }

    // SVG polyline 포맷 문자열을 생성한다.
    private String toPolyline(List<DashboardChartPointDTO> points) {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < points.size(); i++) {
            if (i > 0) {
                builder.append(' ');
            }
            builder.append(points.get(i).getX()).append(',').append(points.get(i).getY());
        }
        return builder.toString();
    }

    // 찜/알림 요약 카드를 대시보드 리스트 형식으로 만든다.
    private List<DashboardListItemDTO> buildWishlistNotifications(DashboardNoticeSummaryDTO summary) {
        DashboardNoticeSummaryDTO safeSummary = summary == null ? new DashboardNoticeSummaryDTO() : summary;
        int receivedBookmarks = nullSafe(safeSummary.getReceivedBookmarkCount());
        int unreadNotifications = nullSafe(safeSummary.getUnreadNotificationCount());
        int auctionWishlistCount = nullSafe(safeSummary.getAuctionWishlistCount());

        List<DashboardListItemDTO> items = new ArrayList<>();
        items.add(DashboardListItemDTO.builder()
                .title("찜 받은 작품/예술관 " + receivedBookmarks + "건")
                .description("내 작품과 예술관에 누적된 북마크 수를 기준으로 집계했습니다.")
                .build());
        items.add(DashboardListItemDTO.builder()
                .title("읽지 않은 알림 " + unreadNotifications + "건")
                .description("입찰, 결제, 반응 관련 새 알림 개수를 확인할 수 있습니다.")
                .build());
        items.add(DashboardListItemDTO.builder()
                .title("내 경매 찜 " + auctionWishlistCount + "건")
                .description("내가 등록한 경매에 관심을 표시한 사용자 수를 집계했습니다.")
                .build());
        return items;
    }

    // 조회 결과가 없을 때 대시보드용 기본 안내 카드를 반환한다.
    private List<DashboardListItemDTO> withFallback(List<DashboardListItemDTO> items, String title, String description) {
        if (items != null && !items.isEmpty()) {
            return items;
        }

        return List.of(DashboardListItemDTO.builder()
                .title(title)
                .description(description)
                .build());
    }

    // 큰 숫자를 대시보드 축약 표기로 변환한다.
    private String formatCompactNumber(long value) {
        if (value >= 1_000_000) {
            return new DecimalFormat("0.0").format(value / 1_000_000.0) + "M";
        }
        if (value >= 1_000) {
            return new DecimalFormat("0.0").format(value / 1_000.0) + "K";
        }
        return String.valueOf(value);
    }

    // 금액을 대시보드 표시용 축약 통화 문자열로 변환한다.
    private String formatCurrencyCompact(long amount) {
        if (amount >= 100_000_000L) {
            return "₩" + new DecimalFormat("0.0").format(amount / 100_000_000.0) + "억";
        }
        if (amount >= 10_000L) {
            return "₩" + new DecimalFormat("0.0").format(amount / 10_000.0) + "만";
        }
        return "₩" + String.format("%,d", amount);
    }

    // 요약 카드 숫자를 두 자리 문자열로 맞춘다.
    private String formatTwoDigits(int value) {
        return String.format("%02d", value);
    }

    // nullable Integer를 0으로 보정한다.
    private int nullSafe(Integer value) {
        return value == null ? 0 : value;
    }

    // nullable Long을 0으로 보정한다.
    private long nullSafe(Long value) {
        return value == null ? 0L : value;
    }

    // 비어 있는 이름은 기본 표시명으로 대체한다.
    private String defaultIfBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    // 필요 시 날짜 포맷 출력을 재사용하기 위한 헬퍼다.
    @SuppressWarnings("unused")
    private String formatDate(LocalDate date) {
        return date == null ? "" : DATE_FORMATTER.format(date);
    }

    // 필요 시 일시 포맷 출력을 재사용하기 위한 헬퍼다.
    @SuppressWarnings("unused")
    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? "" : DATE_FORMATTER.format(dateTime.toLocalDate());
    }

    private enum SeriesType {
        VIEW,
        LIKE,
        SAVE
    }
}
