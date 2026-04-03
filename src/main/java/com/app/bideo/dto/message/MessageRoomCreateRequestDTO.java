package com.app.bideo.dto.message;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageRoomCreateRequestDTO {
    private List<Long> memberIds;
}
