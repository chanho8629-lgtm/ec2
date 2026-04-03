package com.app.bideo.dto.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageRealtimeEventDTO {
    private Long roomId;
    private String type;
    private MessageResponseDTO message;
}
