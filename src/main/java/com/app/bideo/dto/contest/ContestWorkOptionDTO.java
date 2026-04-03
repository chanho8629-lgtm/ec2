package com.app.bideo.dto.contest;

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
public class ContestWorkOptionDTO {
    private Long id;
    private String title;
    private String thumbnailUrl;
}
