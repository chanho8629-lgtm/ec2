package com.app.bideo.dto.common;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrendingKeywordDTO {
    private String keyword;
    private Integer searchCount;
}
