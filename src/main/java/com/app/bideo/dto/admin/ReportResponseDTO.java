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
    private String category;
    private String targetType;
    private Long targetId;
    private Long targetAuthorId;
    private String targetAuthor;
    private String reason;
    private String reasonDetail;
    private String detail;
    private String status;
    private LocalDateTime processedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private String targetName;
    private Integer targetReportCount;
    private String targetStatus;
    private String targetAuthorName;
    private String targetAuthorStatus;
    private Integer reporterHistoryCount;
    private Integer reporterTotalCount;
    private String processMemo;
    private String resolvedMemo;
}
