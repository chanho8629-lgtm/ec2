package com.app.bideo.dto.dashboard;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class DashboardReactionPointDTO {
    private LocalDate day;
    private Integer viewCount;
    private Integer likeCount;
    private Integer saveCount;
}
