package com.app.bideo.dto.notification;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponseDTO {
    private Long id;
    private Long senderId;
    private String senderNickname;
    private String senderProfileImage;
    private String notiType;
    private String targetType;
    private Long targetId;
    private Long messageRoomId;
    private String message;
    private String paymentStatus;
    private String targetImage;
    private Boolean isRead;
    private LocalDateTime createdDatetime;
}
