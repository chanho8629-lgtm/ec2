package com.app.bideo.dto.admin;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CuratorSettingResponseDTO {
    private Long id;
    private String section;
    private String targetType;
    private Long targetId;
    private Integer sortOrder;
    private Boolean isActive;
    private String curatorName;
    private String themeTitle;
    private String intro;
    private Long adminId;
    private LocalDateTime createdDatetime;
}
