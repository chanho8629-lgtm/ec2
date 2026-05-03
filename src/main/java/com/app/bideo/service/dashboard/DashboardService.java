package com.app.bideo.service.dashboard;

import com.app.bideo.dto.dashboard.DashboardChartDTO;
import com.app.bideo.dto.dashboard.DashboardChartLabelDTO;
import com.app.bideo.dto.dashboard.DashboardChartPointDTO;
import com.app.bideo.dto.dashboard.DashboardDailyMetricPointDTO;
import com.app.bideo.dto.dashboard.DashboardListItemDTO;
import com.app.bideo.dto.dashboard.DashboardMetricRangeDTO;
import com.app.bideo.dto.dashboard.DashboardMetricSeriesDTO;
import com.app.bideo.dto.dashboard.DashboardNoticeSummaryDTO;
import com.app.bideo.dto.dashboard.DashboardReactionPointDTO;
import com.app.bideo.dto.dashboard.DashboardResponseDTO;
import com.app.bideo.dto.dashboard.DashboardSummaryItemDTO;
import com.app.bideo.dto.dashboard.DashboardSummaryRawDTO;
import com.app.bideo.dto.dashboard.DashboardSummaryTableDTO;
import com.app.bideo.mapper.dashboard.DashboardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.DecimalFormat;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private static final int[] CHART_X_POSITIONS = {60, 145, 230, 315, 400, 485, 570};
    private static final int CHART_MIN_Y = 52;
    private static final int CHART_MAX_Y = 162;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy. M. d.");
    private static final DateTimeFormatter MONTH_DAY_FORMATTER = DateTimeFormatter.ofPattern("M.d");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("M월");
    private static final int MAX_LOOKBACK_DAYS = 370;

    private final DashboardMapper dashboardMapper;

    // 대시보드 조회
    @Cacheable(value = "dashboard", key = "#memberId")
    public DashboardResponseDTO getDashboard(Long memberId) {
        String creatorName = defaultIfBlank(dashboardMapper.selectCreatorName(memberId), "크리에이터");
        DashboardSummaryRawDTO summary = defaultSummary(dashboardMapper.selectDashboardSummary(memberId));
        DashboardNoticeSummaryDTO noticeSummary = defaultNoticeSummary(dashboardMapper.selectNoticeSummary(memberId));

        int bookmarkedWorkCount = nullSafe(dashboardMapper.selectBookmarkedWorkCount(memberId));
        int ownedWorkCount = nullSafe(dashboardMapper.selectOwnedWorkCount(memberId));
        int ownedGalleryCount = nullSafe(dashboardMapper.selectOwnedGalleryCount(memberId));
        int hostedContestCount = nullSafe(dashboardMapper.selectHostedContestCount(memberId));
        int registeredCardCount = nullSafe(dashboardMapper.selectRegisteredCardCount(memberId));

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(MAX_LOOKBACK_DAYS - 1L);

        Map<LocalDate, Long> bookmarkedDailyMap = toDailyMap(dashboardMapper.selectDailyBookmarkedWorkCounts(memberId, startDate, endDate));
        Map<LocalDate, Long> createdWorkDailyMap = toDailyMap(dashboardMapper.selectDailyCreatedWorkCounts(memberId, startDate, endDate));
        Map<LocalDate, Long> createdGalleryDailyMap = toDailyMap(dashboardMapper.selectDailyCreatedGalleryCounts(memberId, startDate, endDate));

        Map<String, DashboardMetricSeriesDTO> analyticsMetrics = new LinkedHashMap<>();
        analyticsMetrics.put("favorites", buildMetricSeries("favorites", "찜한 작품 추이", String.valueOf(bookmarkedWorkCount), bookmarkedDailyMap, true, "찜한 작품", "개", endDate));
        analyticsMetrics.put("works", buildMetricSeries("works", "내가 만든 작품 추이", String.valueOf(ownedWorkCount), createdWorkDailyMap, true, "내 작품", "개", endDate));
        analyticsMetrics.put("galleries", buildMetricSeries("galleries", "내가 만든 예술관 추이", String.valueOf(ownedGalleryCount), createdGalleryDailyMap, true, "내 예술관", "개", endDate));

        return DashboardResponseDTO.builder()
                .creatorName(creatorName)
                .totalViewsText(formatCompactNumber(nullSafe(summary.getTotalViews())))
                .activeAuctionsText(formatTwoDigits(nullSafe(summary.getActiveAuctionCount())))
                .participatingContestsText(formatTwoDigits(nullSafe(summary.getParticipatingContestCount())))
                .pendingPaymentsText(formatCurrencyCompact(nullSafe(summary.getPendingPaymentAmount())))
                .overviewTitle("오늘까지의 운영 현황을 한 화면에서 확인하세요.")
                .overviewDescription(creatorName + "님의 조회 반응, 찜, 작품/예술관 등록 흐름과 거래 상태를 대시보드에서 바로 확인할 수 있습니다.")
                .attentionCountText(nullSafe(summary.getClosingSoonAuctionCount()) + nullSafe(summary.getPendingPaymentCount()) + nullSafe(summary.getPendingSettlementCount()) + nullSafe(summary.getUnreadNotificationCount()) + "건")
                .analyticsMetrics(analyticsMetrics)
                .summaryTables(buildSummaryTables(summary, noticeSummary, bookmarkedWorkCount, ownedWorkCount, ownedGalleryCount, hostedContestCount, registeredCardCount))
                .reactionChart(buildChart(dashboardMapper.selectReactionTrend(memberId)))
                .myAuctions(withFallback(dashboardMapper.selectMyAuctionItems(memberId), "등록된 경매가 없습니다.", "작품을 경매에 등록하면 진행 현황이 이곳에 표시됩니다."))
                .participatingAuctions(withFallback(dashboardMapper.selectParticipatingAuctionItems(memberId), "참여 중인 경매가 없습니다.", "입찰한 경매가 생기면 현재 상태가 이곳에 표시됩니다."))
                .bookmarkedWorks(withFallback(dashboardMapper.selectBookmarkedWorkItems(memberId), "찜한 작품이 없습니다.", "마음에 드는 작품을 찜하면 이곳에 표시됩니다."))
                .ownedWorks(withFallback(dashboardMapper.selectOwnedWorkItems(memberId), "등록된 작품이 없습니다.", "작품을 등록하면 대표 항목이 이곳에 표시됩니다."))
                .hostedContests(withFallback(dashboardMapper.selectHostedContestItems(memberId), "주최한 공모전이 없습니다.", "공모전을 등록하면 접수 현황이 이곳에 표시됩니다."))
                .participatingContests(withFallback(dashboardMapper.selectParticipatingContestItems(memberId), "참여 중인 공모전이 없습니다.", "출품한 공모전이 생기면 진행 상태가 이곳에 표시됩니다."))
                .galleries(withFallback(dashboardMapper.selectGalleryItems(memberId), "예술관이 없습니다.", "예술관을 만들면 전시 상태가 이곳에 표시됩니다."))
                .soldWorks(withFallback(dashboardMapper.selectSoldWorkItems(memberId), "판매한 작품이 없습니다.", "판매가 완료된 작품이 생기면 이곳에 표시됩니다."))
                .storedWorks(withFallback(dashboardMapper.selectStoredWorkItems(memberId), "보관 중인 작품이 없습니다.", "구매 이후 보관 또는 이관 상태의 작품이 이곳에 표시됩니다."))
                .paymentHistory(withFallback(dashboardMapper.selectPaymentHistoryItems(memberId), "결제 이력이 없습니다.", "구매 또는 판매 결제가 발생하면 이곳에 표시됩니다."))
                .settlements(withFallback(dashboardMapper.selectSettlementItems(memberId), "정산 이력이 없습니다.", "정산 대상 결제가 생기면 이곳에 표시됩니다."))
                .wishlistNotifications(buildWishlistNotifications(noticeSummary))
                .build();
    }

    private DashboardSummaryRawDTO defaultSummary(DashboardSummaryRawDTO summary) {
        return summary == null ? new DashboardSummaryRawDTO() : summary;
    }

    private DashboardNoticeSummaryDTO defaultNoticeSummary(DashboardNoticeSummaryDTO summary) {
        return summary == null ? new DashboardNoticeSummaryDTO() : summary;
    }

    private Map<LocalDate, Long> toDailyMap(List<DashboardDailyMetricPointDTO> points) {
        Map<LocalDate, Long> result = new LinkedHashMap<>();
        if (points == null) {
            return result;
        }
        for (DashboardDailyMetricPointDTO point : points) {
            if (point != null && point.getDay() != null) {
                result.put(point.getDay(), nullSafe(point.getCount()));
            }
        }
        return result;
    }

    private DashboardMetricSeriesDTO buildMetricSeries(String key, String title, String valueText, Map<LocalDate, Long> rawDailyMap, boolean cumulative, String noun, String unit, LocalDate endDate) {
        Map<String, DashboardMetricRangeDTO> ranges = new LinkedHashMap<>();
        ranges.put("28d", buildDayBucketRange("28d", "지난 28일", rawDailyMap, cumulative, endDate.minusDays(27), endDate, 4, noun, unit));
        ranges.put("month", buildWeekRange("month", "이번 달", rawDailyMap, cumulative, endDate.withDayOfMonth(1), endDate, noun, unit));
        ranges.put("3m", buildMonthRange("3m", "최근 3개월", rawDailyMap, cumulative, endDate.minusMonths(2).withDayOfMonth(1), endDate, noun, unit));
        ranges.put("6m", buildMonthRange("6m", "최근 6개월", rawDailyMap, cumulative, endDate.minusMonths(5).withDayOfMonth(1), endDate, noun, unit));
        ranges.put("12m", buildMonthRange("12m", "최근 12개월", rawDailyMap, cumulative, endDate.minusMonths(11).withDayOfMonth(1), endDate, noun, unit));
        DashboardMetricRangeDTO defaultRange = ranges.get("28d");
        return DashboardMetricSeriesDTO.builder()
                .key(key)
                .title(title)
                .valueText(valueText)
                .summary(defaultRange == null ? "" : defaultRange.getSummary())
                .ranges(ranges)
                .build();
    }

    private DashboardMetricRangeDTO buildDayBucketRange(String key, String label, Map<LocalDate, Long> rawDailyMap, boolean cumulative, LocalDate startDate, LocalDate endDate, int bucketDays, String noun, String unit) {
        List<String> labels = new ArrayList<>();
        List<Long> values = new ArrayList<>();
        LocalDate bucketStart = startDate;
        while (!bucketStart.isAfter(endDate)) {
            LocalDate bucketEnd = bucketStart.plusDays(bucketDays - 1L);
            if (bucketEnd.isAfter(endDate)) bucketEnd = endDate;
            labels.add(MONTH_DAY_FORMATTER.format(bucketEnd));
            values.add(calculateValue(rawDailyMap, bucketStart, bucketEnd, cumulative));
            bucketStart = bucketEnd.plusDays(1);
        }
        return DashboardMetricRangeDTO.builder()
                .key(key).label(label).dateRangeText(formatDateRange(startDate, endDate))
                .summary(buildSummaryText(label, noun, unit, values))
                .labels(labels).values(values).build();
    }

    private DashboardMetricRangeDTO buildWeekRange(String key, String label, Map<LocalDate, Long> rawDailyMap, boolean cumulative, LocalDate startDate, LocalDate endDate, String noun, String unit) {
        List<String> labels = new ArrayList<>();
        List<Long> values = new ArrayList<>();
        LocalDate bucketStart = startDate;
        while (!bucketStart.isAfter(endDate)) {
            LocalDate bucketEnd = bucketStart.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
            if (bucketEnd.isAfter(endDate)) bucketEnd = endDate;
            labels.add(MONTH_DAY_FORMATTER.format(bucketEnd));
            values.add(calculateValue(rawDailyMap, bucketStart, bucketEnd, cumulative));
            bucketStart = bucketEnd.plusDays(1);
        }
        return DashboardMetricRangeDTO.builder()
                .key(key).label(label).dateRangeText(formatDateRange(startDate, endDate))
                .summary(buildSummaryText(label, noun, unit, values))
                .labels(labels).values(values).build();
    }

    private DashboardMetricRangeDTO buildMonthRange(String key, String label, Map<LocalDate, Long> rawDailyMap, boolean cumulative, LocalDate startDate, LocalDate endDate, String noun, String unit) {
        List<String> labels = new ArrayList<>();
        List<Long> values = new ArrayList<>();
        YearMonth cursor = YearMonth.from(startDate);
        YearMonth endMonth = YearMonth.from(endDate);
        while (!cursor.isAfter(endMonth)) {
            LocalDate bucketStart = cursor.atDay(1);
            if (bucketStart.isBefore(startDate)) bucketStart = startDate;
            LocalDate bucketEnd = cursor.atEndOfMonth();
            if (bucketEnd.isAfter(endDate)) bucketEnd = endDate;
            labels.add(MONTH_FORMATTER.format(bucketEnd));
            values.add(calculateValue(rawDailyMap, bucketStart, bucketEnd, cumulative));
            cursor = cursor.plusMonths(1);
        }
        return DashboardMetricRangeDTO.builder()
                .key(key).label(label).dateRangeText(formatDateRange(startDate, endDate))
                .summary(buildSummaryText(label, noun, unit, values))
                .labels(labels).values(values).build();
    }

    private long calculateValue(Map<LocalDate, Long> rawDailyMap, LocalDate startDate, LocalDate endDate, boolean cumulative) {
        long value = 0L;
        for (Map.Entry<LocalDate, Long> entry : rawDailyMap.entrySet()) {
            LocalDate day = entry.getKey();
            if (cumulative) {
                if (!day.isAfter(endDate)) value += entry.getValue();
            } else if ((day.isEqual(startDate) || day.isAfter(startDate)) && (day.isEqual(endDate) || day.isBefore(endDate))) {
                value += entry.getValue();
            }
        }
        return value;
    }

    private String buildSummaryText(String label, String noun, String unit, List<Long> values) {
        long latest = values.isEmpty() ? 0L : values.get(values.size() - 1);
        return label + " 기준 " + noun + "은 " + formatNumber(latest) + unit + "입니다.";
    }

    private String formatDateRange(LocalDate startDate, LocalDate endDate) {
        return DATE_FORMATTER.format(startDate) + " ~ " + DATE_FORMATTER.format(endDate);
    }

    private List<DashboardSummaryTableDTO> buildSummaryTables(DashboardSummaryRawDTO summary, DashboardNoticeSummaryDTO noticeSummary, int bookmarkedWorkCount, int ownedWorkCount, int ownedGalleryCount, int hostedContestCount, int registeredCardCount) {
        List<DashboardSummaryTableDTO> tables = new ArrayList<>();
        tables.add(DashboardSummaryTableDTO.builder().title("경매 요약").description("지난 28일 기준 경매 현황").items(List.of(
                item("진행중인 경매", formatCount(nullSafe(summary.getActiveAuctionCount()))),
                item("낙찰된 경매", formatCount(nullSafe(summary.getSoldAuctionCount()))),
                item("개최한 경매", formatCount(nullSafe(summary.getHostedAuctionCount()))),
                item("총 경매 거래액", formatNumber(nullSafe(summary.getTotalAuctionTransactionAmount())))
        )).build());
        tables.add(DashboardSummaryTableDTO.builder().title("공모전 요약").description("지난 28일 기준 공모전 현황").items(List.of(
                item("진행 중인 공모전", formatCount(nullSafe(summary.getActiveContestCount()))),
                item("참여한 공모전", formatCount(nullSafe(summary.getParticipatingContestCount()))),
                item("수상한 공모전", formatCount(nullSafe(summary.getAwardedContestCount())))
        )).build());
        tables.add(DashboardSummaryTableDTO.builder().title("작품/예술관 요약").description("지난 28일 기준 작품 및 전시 현황").items(List.of(
                item("등록 작품 수", formatCount(ownedWorkCount)),
                item("찜한 작품", formatCount(bookmarkedWorkCount)),
                item("예술관 섹션 수", ownedGalleryCount + "개"),
                item("누적 조회수", formatNumber(nullSafe(summary.getTotalViews())) + "회"),
                item("안내", "※작품+예술관 조회수 합산입니다.")
        )).build());
        tables.add(DashboardSummaryTableDTO.builder().title("출금/결제 요약").description("지난 28일 기준 정산 및 결제 현황").items(List.of(
                item("출금 완료", formatCount(nullSafe(summary.getCompletedWithdrawalCount()))),
                item("결제 대기", formatCount(nullSafe(summary.getPendingPaymentCount()))),
                item("정산 예정 금액", formatNumber(nullSafe(summary.getPlannedSettlementAmount()))),
                item("총 결제 금액", formatNumber(nullSafe(summary.getTotalPaymentAmount())))
        )).build());
        tables.add(DashboardSummaryTableDTO.builder().title("카드 요약").description("지난 28일 기준 카드 관리 현황").items(List.of(
                item("등록 카드", registeredCardCount + "장"),
                item("결제 성공", formatCount(nullSafe(summary.getPaymentSuccessCount()))),
                item("결제 실패", formatCount(nullSafe(summary.getPaymentFailureCount())))
        )).build());
        return tables;
    }

    private DashboardSummaryItemDTO item(String label, String value) {
        return DashboardSummaryItemDTO.builder().label(label).value(value).build();
    }

    private DashboardChartDTO buildChart(List<DashboardReactionPointDTO> rawPoints) {
        List<DashboardReactionPointDTO> safeRawPoints = rawPoints == null ? List.of() : rawPoints;
        List<DashboardReactionPointDTO> points = ensureSevenDays(safeRawPoints);
        int maxValue = 1;
        for (DashboardReactionPointDTO point : points) {
            maxValue = Math.max(maxValue, Math.max(nullSafe(point.getViewCount()), Math.max(nullSafe(point.getLikeCount()), nullSafe(point.getSaveCount()))));
        }
        List<DashboardChartPointDTO> viewPoints = mapChartPoints(points, maxValue, SeriesType.VIEW);
        List<DashboardChartPointDTO> likePoints = mapChartPoints(points, maxValue, SeriesType.LIKE);
        List<DashboardChartPointDTO> savePoints = mapChartPoints(points, maxValue, SeriesType.SAVE);
        List<DashboardChartLabelDTO> labels = new ArrayList<>();
        for (int i = 0; i < points.size(); i++) {
            labels.add(new DashboardChartLabelDTO(CHART_X_POSITIONS[i], points.get(i).getDay().getDayOfWeek().getDisplayName(TextStyle.NARROW, Locale.KOREAN)));
        }
        return DashboardChartDTO.builder().viewPolylinePoints(toPolyline(viewPoints)).likePolylinePoints(toPolyline(likePoints)).savePolylinePoints(toPolyline(savePoints)).viewPoints(viewPoints).likePoints(likePoints).savePoints(savePoints).labels(labels).build();
    }

    private List<DashboardReactionPointDTO> ensureSevenDays(List<DashboardReactionPointDTO> rawPoints) {
        List<DashboardReactionPointDTO> result = new ArrayList<>();
        LocalDate start = LocalDate.now().minusDays(6);
        for (int i = 0; i < 7; i++) {
            LocalDate day = start.plusDays(i);
            DashboardReactionPointDTO matched = rawPoints.stream().filter(point -> day.equals(point.getDay())).findFirst().orElseGet(() -> {
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

    private String toPolyline(List<DashboardChartPointDTO> points) {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < points.size(); i++) {
            if (i > 0) builder.append(' ');
            builder.append(points.get(i).getX()).append(',').append(points.get(i).getY());
        }
        return builder.toString();
    }

    private List<DashboardListItemDTO> buildWishlistNotifications(DashboardNoticeSummaryDTO summary) {
        DashboardNoticeSummaryDTO safeSummary = summary == null ? new DashboardNoticeSummaryDTO() : summary;
        int receivedBookmarks = nullSafe(safeSummary.getReceivedBookmarkCount());
        int unreadNotifications = nullSafe(safeSummary.getUnreadNotificationCount());
        int auctionWishlistCount = nullSafe(safeSummary.getAuctionWishlistCount());
        List<DashboardListItemDTO> items = new ArrayList<>();
        items.add(DashboardListItemDTO.builder().title("찜 받은 작품/예술관 " + receivedBookmarks + "건").description("내 작품과 예술관에 누적된 북마크 수를 기준으로 집계했습니다.").build());
        items.add(DashboardListItemDTO.builder().title("읽지 않은 알림 " + unreadNotifications + "건").description("입찰, 결제, 반응 관련 새 알림 개수를 확인할 수 있습니다.").build());
        items.add(DashboardListItemDTO.builder().title("내 경매 찜 " + auctionWishlistCount + "건").description("내가 등록한 경매에 관심을 표시한 사용자 수를 집계했습니다.").build());
        return items;
    }

    private List<DashboardListItemDTO> withFallback(List<DashboardListItemDTO> items, String title, String description) {
        if (items != null && !items.isEmpty()) return items;
        return List.of(DashboardListItemDTO.builder().title(title).description("").build());
    }

    private String formatCompactNumber(long value) {
        if (value >= 1_000_000) return new DecimalFormat("0.0").format(value / 1_000_000.0) + "M";
        if (value >= 1_000) return new DecimalFormat("0.0").format(value / 1_000.0) + "K";
        return String.valueOf(value);
    }

    private String formatCurrencyCompact(long amount) {
        if (amount >= 100_000_000L) return "₩" + new DecimalFormat("0.0").format(amount / 100_000_000.0) + "억";
        if (amount >= 10_000L) return "₩" + new DecimalFormat("0.0").format(amount / 10_000.0) + "만";
        return "₩" + String.format("%,d", amount);
    }

    private String formatTwoDigits(int value) {
        return String.format("%02d", value);
    }

    private String formatCount(int value) {
        return value + "건";
    }

    private String formatNumber(long value) {
        return String.format("%,d", value);
    }

    private int nullSafe(Integer value) {
        return value == null ? 0 : value;
    }

    private long nullSafe(Long value) {
        return value == null ? 0L : value;
    }

    private String defaultIfBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    @SuppressWarnings("unused")
    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? "" : DATE_FORMATTER.format(dateTime.toLocalDate());
    }

    private enum SeriesType {
        VIEW, LIKE, SAVE
    }
}
