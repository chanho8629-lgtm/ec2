package com.app.bideo.dto.admin;

import lombok.*;

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
    private String createdDatetime;
    private Integer viewCount;
    private Integer reportCount;
}
