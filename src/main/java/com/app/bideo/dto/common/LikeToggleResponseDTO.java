package com.app.bideo.dto.common;

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
public class LikeToggleResponseDTO {
    private Long targetId;
    private String targetType;
    private Integer likeCount;
    private Boolean liked;
}
