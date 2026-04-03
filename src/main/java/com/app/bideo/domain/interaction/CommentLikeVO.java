package com.app.bideo.domain.interaction;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentLikeVO {
    private Long id;
    private Long commentId;
    private Long memberId;
    private LocalDateTime createdDatetime;
}
