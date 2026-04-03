package com.app.bideo.dto.gallery;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchGalleryCoverDataDTO {
    private String coverImage;
    private LocalDateTime updatedDatetime;
}
