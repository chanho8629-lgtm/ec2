package com.app.bideo.dto.interaction;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentCreateRequestDTO {
    private String targetType;
    private Long targetId;
    private Long parentId;
    private String content;
}
