package com.app.bideo.dto.admin;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminWorkListResponseDTO {
    private Long id;
    private String title;
    private String artistName;
    private String category;
    private String saleType;
    private String status;
    private LocalDateTime createdAt;
    private Integer viewCount;
    private Integer reportCount;
    private Long price;
    private String thumbnailUrl;
    private String videoUrl;
}
