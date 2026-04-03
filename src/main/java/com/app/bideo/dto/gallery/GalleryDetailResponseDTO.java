package com.app.bideo.dto.gallery;

import com.app.bideo.dto.common.TagResponseDTO;
import com.app.bideo.dto.work.WorkListResponseDTO;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryDetailResponseDTO {
    private Long id;
    private Long memberId;
    private String memberNickname;
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
    private List<TagResponseDTO> tags;
    private List<WorkListResponseDTO> works;
    private Boolean isLiked;
    private Boolean isBookmarked;
    private Boolean isFollowing;
    private LocalDateTime createdDatetime;
}
