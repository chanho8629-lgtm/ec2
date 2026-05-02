package com.app.bideo.dto.admin;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminWorkDetailResponseDTO {
    private Long id;
    private String title;
    private String artistName;
    private String artistNickname;
    private Long artistId;
    private String category;
    private String saleType;
    private String status;
    private LocalDateTime createdAt;
    private Integer viewCount;
    private Integer likeCount;
    private String thumbnailUrl;
    private String videoUrl;
    private String fileType;
    private Integer fileWidth;
    private Integer fileHeight;
    private Long fileSize;
    private String resolution;
    private String auctionStatus;
    private Long currentPrice;
    private Integer bidCount;
    private Integer reportCount;
    private LocalDateTime lastReportDate;
    private Long price;
}
