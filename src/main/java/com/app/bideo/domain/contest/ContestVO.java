package com.app.bideo.domain.contest;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContestVO {
    private Long id;
    private Long memberId;
    private String title;
    private String organizer;
    private String category;
    private String description;
    private String coverImage;
    private LocalDate entryStart;
    private LocalDate entryEnd;
    private LocalDate resultDate;
    private String prizeInfo;
    private Integer price;
    private String status;
    private Integer entryCount;
    private Integer viewCount;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
    private LocalDateTime deletedDatetime;
}
