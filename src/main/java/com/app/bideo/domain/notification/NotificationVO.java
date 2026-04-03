package com.app.bideo.domain.notification;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationVO {
    private Long id;
    private Long memberId;
    private Long senderId;
    private String notiType;
    private String targetType;
    private Long targetId;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdDatetime;
}
