package com.app.bideo.dto.member;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberBadgeResponseDTO {
    private Long id;
    private Long badgeId;
    private String badgeKey;
    private String badgeName;
    private String imageFile;
    private Boolean isDisplayed;
    private LocalDateTime earnedAt;
}
