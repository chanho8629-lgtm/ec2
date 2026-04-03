package com.app.bideo.dto.gallery;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryWorkRequestDTO {
    private Long workId;
    private Integer sortOrder;
}
