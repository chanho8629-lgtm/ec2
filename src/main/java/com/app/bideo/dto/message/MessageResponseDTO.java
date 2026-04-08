package com.app.bideo.dto.message;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponseDTO {
    private Long id;
    private Long messageRoomId;
    private Long senderId;
    private String senderNickname;
    private String senderProfileImage;
    private String content;
    private Boolean isRead;
    private LocalDateTime updatedDatetime;
    private Boolean edited;
    private Boolean deleted;
    private Long replyToMessageId;
    private String replyPreview;
    private String replySenderNickname;
    private Integer likeCount;
    private Boolean isLiked;
    private Boolean canEdit;
    private Boolean canDelete;
    private Boolean isSelf;
    private LocalDateTime createdDatetime;
}
