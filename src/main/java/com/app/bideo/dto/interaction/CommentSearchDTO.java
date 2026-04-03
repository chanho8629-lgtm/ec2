package com.app.bideo.dto.interaction;

import com.app.bideo.dto.common.PageRequestDTO;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentSearchDTO extends PageRequestDTO {
    private String targetType;
    private Long targetId;
}
