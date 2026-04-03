package com.app.bideo.dto.interaction;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentUpdateRequestDTO {
    private String content;
}
