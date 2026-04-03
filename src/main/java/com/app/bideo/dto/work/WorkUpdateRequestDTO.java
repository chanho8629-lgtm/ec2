package com.app.bideo.dto.work;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkUpdateRequestDTO {
    private Long id;
    private Long galleryId;
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
    private Boolean auctionEnabled;
    private Integer auctionStartingPrice;
    private Integer auctionDeadlineHours;
    private List<Long> tagIds;
    private List<String> tagNames;
    private List<WorkFileRequestDTO> files;
}
