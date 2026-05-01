package com.app.bideo.dto.work;

import com.app.bideo.dto.common.PageRequestDTO;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkSearchDTO extends PageRequestDTO {
    private String keyword;
    private String category;
    private Long memberId;
    private Long currentMemberId;
    private Long galleryId;
    private String licenseType;
    private Boolean isTradable;
    private Boolean allowComment;
    private Boolean showSimilar;
    private String status;
}
