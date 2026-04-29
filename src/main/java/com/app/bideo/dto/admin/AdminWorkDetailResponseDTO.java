package com.app.bideo.dto.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminWorkDetailResponseDTO {
    private Long id;
    private String title;
    private String artistName;
    private Long artistId;
    private String category;
    private String saleType;
    private String status;
    private String createdDatetime;
    private Integer viewCount;
    private Integer saveCount;
    private String thumbnailUrl;
    private String videoUrl;
    private String fileType;
    private Integer fileWidth;
    private Integer fileHeight;
    private Long fileSize;
    private String auctionStatus;
    private Long currentHighBid;
    private Integer bidCount;
    private Integer reportCount;
    private String lastReportDate;
}
