package com.app.bideo.dto.work;

import com.app.bideo.domain.work.WorkVO;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkDTO {
    private Long id;
    private Long memberId;
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
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
    private LocalDateTime deletedDatetime;

    public WorkVO toVO() {
        return WorkVO.builder()
                .id(id)
                .memberId(memberId)
                .title(title)
                .category(category)
                .description(description)
                .price(price)
                .licenseType(licenseType)
                .licenseTerms(licenseTerms)
                .isTradable(isTradable)
                .allowComment(allowComment)
                .showSimilar(showSimilar)
                .linkUrl(linkUrl)
                .viewCount(viewCount)
                .likeCount(likeCount)
                .saveCount(saveCount)
                .commentCount(commentCount)
                .status(status)
                .createdDatetime(createdDatetime)
                .updatedDatetime(updatedDatetime)
                .deletedDatetime(deletedDatetime)
                .build();
    }

    public static WorkDTO from(WorkVO workVO) {
        return WorkDTO.builder()
                .id(workVO.getId())
                .memberId(workVO.getMemberId())
                .title(workVO.getTitle())
                .category(workVO.getCategory())
                .description(workVO.getDescription())
                .price(workVO.getPrice())
                .licenseType(workVO.getLicenseType())
                .licenseTerms(workVO.getLicenseTerms())
                .isTradable(workVO.getIsTradable())
                .allowComment(workVO.getAllowComment())
                .showSimilar(workVO.getShowSimilar())
                .linkUrl(workVO.getLinkUrl())
                .viewCount(workVO.getViewCount())
                .likeCount(workVO.getLikeCount())
                .saveCount(workVO.getSaveCount())
                .commentCount(workVO.getCommentCount())
                .status(workVO.getStatus())
                .createdDatetime(workVO.getCreatedDatetime())
                .updatedDatetime(workVO.getUpdatedDatetime())
                .deletedDatetime(workVO.getDeletedDatetime())
                .build();
    }
}
