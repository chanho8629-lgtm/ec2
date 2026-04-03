package com.app.bideo.domain.common;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchHistoryVO {
    private Long id;
    private Long memberId;
    private String keyword;
    private LocalDateTime searchedAt;
}
