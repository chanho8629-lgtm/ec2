package com.app.bideo.dto.gallery;

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
public class SearchGalleryCoverResponseDTO {
    private String contentType;
    private byte[] bytes;
    private String cacheControl;
}
