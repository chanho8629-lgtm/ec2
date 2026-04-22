package com.app.bideo.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetricSeriesDTO {
    private String key;
    private String title;
    private String valueText;
    private String summary;
    private Map<String, DashboardMetricRangeDTO> ranges;
}
