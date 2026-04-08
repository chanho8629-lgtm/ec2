package com.app.bideo.dto.admin;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponseDTO {
    private Long id;
    private Long reporterId;
    private String reporterNickname;
    private String targetType;
    private Long targetId;
    private String reason;
    private String detail;
    private String status;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdDatetime;
    private String targetName;
    private Integer targetReportCount;
    private String targetStatus;
    private String targetAuthorName;
    private String targetAuthorStatus;
    private Integer reporterHistoryCount;
    private String resolvedMemo;
}
