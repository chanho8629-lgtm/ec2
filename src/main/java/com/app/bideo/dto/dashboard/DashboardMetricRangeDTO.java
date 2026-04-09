package com.app.bideo.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetricRangeDTO {
    private String key;
    private String label;
    private String dateRangeText;
    private String summary;
    private List<String> labels;
    private List<Long> values;
}
