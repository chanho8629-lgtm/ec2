package com.app.bideo.domain.admin;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaqVO {
    private Long id;
    private String question;
    private String answer;
    private String category;
    private Integer sortOrder;
    private Boolean isActive;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
}
