package com.app.bideo.domain.work;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@ToString
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@SuperBuilder
public class WorkVO {
    private Long id;
    private Long memberId;
    private String title;
    private String category;
    private String description;
    private Long price;
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
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
    private LocalDateTime deletedDatetime;
}
