package com.app.bideo.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardListItemDTO {
    private String tag;
    private boolean goldTag;
    private String title;
    private String description;
    private String amount;
    private String detailUrl;
    private Long downloadWorkId;
}
