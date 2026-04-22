package com.app.bideo.dto.work;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkListResponseDTO {
    private Long id;
    private Long memberId;
    private String title;
    private String category;
    private Boolean isTradable;
    private Long price;
    private String status;
    private String memberNickname;
    private String memberProfileImage;
    private String thumbnailUrl;
    private String thumbnailFileType;
    private Integer thumbnailWidth;
    private Integer thumbnailHeight;
    private Integer viewCount;
    private Integer likeCount;
    private Integer saveCount;
    private Integer commentCount;
    private LocalDateTime createdDatetime;
}
