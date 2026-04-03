package com.app.bideo.domain.common;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeVO {
    private Long id;
    private String badgeKey;
    private String badgeName;
    private String imageFile;
    private String description;
}
