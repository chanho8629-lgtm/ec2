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
public class DashboardChartDTO {
    private String viewPolylinePoints;
    private String likePolylinePoints;
    private String savePolylinePoints;
    private List<DashboardChartPointDTO> viewPoints;
    private List<DashboardChartPointDTO> likePoints;
    private List<DashboardChartPointDTO> savePoints;
    private List<DashboardChartLabelDTO> labels;
}
