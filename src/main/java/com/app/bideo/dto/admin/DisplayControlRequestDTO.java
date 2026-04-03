package com.app.bideo.dto.admin;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisplayControlRequestDTO {
    private String targetType;
    private Long targetId;
    private String action;
    private String reason;
    private String blockType;
    private LocalDateTime endDatetime;
}
