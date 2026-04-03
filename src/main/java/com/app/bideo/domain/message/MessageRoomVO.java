package com.app.bideo.domain.message;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageRoomVO {
    private Long id;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
}
