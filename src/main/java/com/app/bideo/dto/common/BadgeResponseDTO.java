package com.app.bideo.dto.common;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeResponseDTO {
    private Long id;
    private String badgeKey;
    private String badgeName;
    private String imageFile;
    private String description;
}
