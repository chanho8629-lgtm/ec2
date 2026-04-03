package com.app.bideo.domain.interaction;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentVO {
    private Long id;
    private Long memberId;
    private String targetType;
    private Long targetId;
    private Long parentId;
    private String content;
    private Boolean isPinned;
    private Integer likeCount;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
    private LocalDateTime deletedDatetime;
}
