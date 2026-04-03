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
public class SearchGallerySuggestionDTO {
    private Long id;
    private String title;
    private String coverImageUrl;
    private Boolean hasCoverImage;
}
