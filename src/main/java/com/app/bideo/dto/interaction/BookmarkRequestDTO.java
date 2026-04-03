package com.app.bideo.dto.interaction;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkRequestDTO {
    private String targetType;
    private Long targetId;
}
