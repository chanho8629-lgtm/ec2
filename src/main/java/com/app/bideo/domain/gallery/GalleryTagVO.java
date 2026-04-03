package com.app.bideo.domain.gallery;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryTagVO {
    private Long id;
    private Long galleryId;
    private Long tagId;
}
