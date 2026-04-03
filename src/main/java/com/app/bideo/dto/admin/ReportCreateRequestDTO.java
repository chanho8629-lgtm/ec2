package com.app.bideo.dto.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportCreateRequestDTO {
    private String targetType;
    private Long targetId;
    private String reason;
    private String detail;
}
