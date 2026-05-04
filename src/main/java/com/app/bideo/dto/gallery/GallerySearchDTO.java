package com.app.bideo.dto.gallery;

import com.app.bideo.dto.common.PageRequestDTO;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GallerySearchDTO extends PageRequestDTO {
    private String keyword;
    private String tag;
    private Long memberId;
    private String status;
}
