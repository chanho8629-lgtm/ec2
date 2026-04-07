package com.app.bideo.dto.work;

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
public class WorkCreateResponseDTO {
    private Long id;
    private Long galleryId;
    private String redirectUrl;
}
