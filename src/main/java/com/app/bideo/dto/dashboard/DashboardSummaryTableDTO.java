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
public class DashboardSummaryTableDTO {
    private String title;
    private String description;
    private List<DashboardSummaryItemDTO> items;
}
