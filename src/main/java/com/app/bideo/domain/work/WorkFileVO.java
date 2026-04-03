package com.app.bideo.domain.work;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkFileVO {
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
