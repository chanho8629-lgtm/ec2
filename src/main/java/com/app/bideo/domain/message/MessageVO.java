package com.app.bideo.domain.message;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageVO {
    private Long id;
    private Long messageRoomId;
    private Long senderId;
    private Long replyToMessageId;
    private String content;
    private Boolean isRead;
    private Integer likeCount;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
    private LocalDateTime deletedDatetime;
}
