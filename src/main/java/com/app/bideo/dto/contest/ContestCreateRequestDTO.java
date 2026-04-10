package com.app.bideo.dto.contest;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContestCreateRequestDTO {
    private Long id;
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
    private List<Long> tagIds;
    private List<String> tagNames;
}
