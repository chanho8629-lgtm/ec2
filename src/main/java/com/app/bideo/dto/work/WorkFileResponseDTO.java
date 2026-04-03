package com.app.bideo.dto.work;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkFileResponseDTO {
    private Long id;
    private Long workId;
    private String fileUrl;
    private String fileType;
    private Integer fileSize;
    private Integer width;
    private Integer height;
    private Integer sortOrder;
    private LocalDateTime createdDatetime;
}
