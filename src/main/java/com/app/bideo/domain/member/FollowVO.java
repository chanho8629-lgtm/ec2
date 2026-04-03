package com.app.bideo.domain.member;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowVO {
    private Long id;
    private Long followerId;
    private Long followingId;
    private LocalDateTime createdDatetime;
}
