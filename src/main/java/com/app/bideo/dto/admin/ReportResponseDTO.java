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
}
