package com.app.bideo.dto.contest;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContestListResponseDTO {
    private Long id;
    private String title;
    private String organizer;
    private String category;
    private String coverImage;
    private LocalDate entryEnd;
    private String status;
    private Integer entryCount;
    private String dDay;
    private LocalDateTime createdDatetime;
}
