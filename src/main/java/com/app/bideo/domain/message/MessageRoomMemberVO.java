package com.app.bideo.domain.message;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageRoomMemberVO {
    private Long id;
    private Long messageRoomId;
    private Long memberId;
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
}
