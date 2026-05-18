package com.app.bideo.dto.work;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkCreateRequestDTO {
    private Long galleryId;
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
    private Boolean auctionEnabled;
    private Long auctionStartingPrice;
    private Integer auctionDeadlineHours;
    private List<Long> tagIds;
    private List<String> tagNames;
    private List<WorkFileRequestDTO> files;
    private String mediaType;
    private Integer titleLength;
    private Integer descriptionLength;
    private Integer tagCount;
    private Boolean thumbnailExists;
    private Boolean isAiGenerated;
    private Double aiQualityScore;
    private Long predictedViews;
    private Integer predictedLikeCount;
    private Integer predictedPopular;
    private Double predictedPopularProbability;
}
