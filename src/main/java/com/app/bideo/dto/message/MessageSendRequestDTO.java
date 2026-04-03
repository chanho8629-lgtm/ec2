package com.app.bideo.dto.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageSendRequestDTO {
    private Long messageRoomId;
    private Long replyToMessageId;
    @NotBlank
    @Size(max = 255)
    private String content;
}
