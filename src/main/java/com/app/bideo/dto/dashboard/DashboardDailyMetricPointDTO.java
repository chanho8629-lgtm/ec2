package com.app.bideo.dto.dashboard;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class DashboardDailyMetricPointDTO {
    private LocalDate day;
    private Long count;
}
