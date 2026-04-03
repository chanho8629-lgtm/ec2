package com.app.bideo.dto.gallery;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryCreateRequestDTO {
    private Long id;
    private Long memberId;
    private String title;
    private String description;
    private String coverImage;
    private Boolean allowComment;
    private Boolean showSimilar;
    private List<Long> tagIds;
    private List<String> tagNames;
    private List<Long> workIds;
}
