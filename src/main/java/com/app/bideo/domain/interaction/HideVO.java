package com.app.bideo.domain.interaction;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HideVO {
    private Long id;
    private Long memberId;
    private String targetType;
    private Long targetId;
    private LocalDateTime createdDatetime;
}
