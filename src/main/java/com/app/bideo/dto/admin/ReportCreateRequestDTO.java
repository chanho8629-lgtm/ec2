package com.app.bideo.dto.admin;

import com.app.bideo.common.enumeration.ReportReason;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportCreateRequestDTO {
    private String targetType;
    private Long targetId;
    private ReportReason reason;
    private String detail;
}
