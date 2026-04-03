package com.app.bideo.dto.message;

import com.app.bideo.dto.member.MemberListResponseDTO;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageRoomResponseDTO {
    private Long id;
    private List<MemberListResponseDTO> members;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private Integer unreadCount;
}
