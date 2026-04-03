package com.app.bideo.domain.member;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlockVO {
    private Long id;
    private Long blockerId;
    private Long blockedId;
    private LocalDateTime createdDatetime;
}
