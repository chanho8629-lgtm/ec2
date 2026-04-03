package com.app.bideo.domain.member;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberBadgeVO {
    private Long id;
    private Long memberId;
    private Long badgeId;
    private Boolean isDisplayed;
    private LocalDateTime earnedAt;
}
