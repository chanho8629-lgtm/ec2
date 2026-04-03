package com.app.bideo.dto.work;

import com.app.bideo.dto.common.TagResponseDTO;
import com.app.bideo.dto.interaction.CommentResponseDTO;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkDetailResponseDTO {
    private Long id;
    private Long galleryId;
    private Long memberId;
    private String memberNickname;
    private String memberProfileImage;
    private String title;
    private String category;
    private String description;
    private Integer price;
    private String licenseType;
    private String licenseTerms;
    private Boolean isTradable;
    private Boolean allowComment;
    private Boolean showSimilar;
    private String linkUrl;
    private Integer viewCount;
    private Integer likeCount;
    private Integer saveCount;
    private Integer commentCount;
    private String status;
    private List<TagResponseDTO> tags;
    private List<WorkFileResponseDTO> files;
    private List<CommentResponseDTO> comments;
    private Boolean isLiked;
    private Boolean isBookmarked;
    private Boolean hasActiveAuction;
    private Boolean hasEndedAuction;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
    private LocalDateTime deletedDatetime;
}
