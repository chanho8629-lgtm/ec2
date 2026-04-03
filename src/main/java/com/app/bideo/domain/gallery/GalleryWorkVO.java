package com.app.bideo.domain.gallery;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryWorkVO {
    private Long id;
    private Long galleryId;
    private Long workId;
    private Integer sortOrder;
    private LocalDateTime addedAt;
}
