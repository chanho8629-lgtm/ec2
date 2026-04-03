package com.app.bideo.dto.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CuratorSettingRequestDTO {
    private String section;
    private String targetType;
    private Long targetId;
    private Integer sortOrder;
    private Boolean isActive;
    private String curatorName;
    private String themeTitle;
    private String intro;
}
