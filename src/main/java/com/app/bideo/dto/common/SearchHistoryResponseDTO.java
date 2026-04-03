package com.app.bideo.dto.common;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchHistoryResponseDTO {
    private Long id;
    private String keyword;
    private LocalDateTime searchedAt;
}
