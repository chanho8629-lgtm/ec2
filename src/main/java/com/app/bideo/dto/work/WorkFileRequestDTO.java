package com.app.bideo.dto.work;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkFileRequestDTO {
    private String fileUrl;
    private String fileType;
    private Integer fileSize;
    private Integer width;
    private Integer height;
    private Integer sortOrder;
}
