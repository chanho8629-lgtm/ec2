package com.app.bideo.dto.gallery;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryCreateResponseDTO {
    private Long galleryId;
    private Long memberId;
    private String memberNickname;
    private String redirectUrl;
}
