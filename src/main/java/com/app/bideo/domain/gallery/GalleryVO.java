package com.app.bideo.domain.gallery;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryVO {
    private Long id;
    private Long memberId;
    private String title;
    private String description;
    private String coverImage;
    private Boolean allowComment;
    private Boolean showSimilar;
    private Integer workCount;
    private Integer likeCount;
    private Integer commentCount;
    private Integer viewCount;
    private String status;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
    private LocalDateTime deletedDatetime;
}
