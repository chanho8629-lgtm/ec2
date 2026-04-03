package com.app.bideo.dto.common;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagResponseDTO {
    private Long id;
    private String tagName;
}
