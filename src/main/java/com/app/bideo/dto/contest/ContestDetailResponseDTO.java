package com.app.bideo.dto.contest;

import com.app.bideo.dto.common.TagResponseDTO;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContestDetailResponseDTO {
    private Long id;
    private Long memberId;
    private String memberNickname;
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
    private List<TagResponseDTO> tags;
    private Boolean isBookmarked;
    private LocalDateTime winnerNotifiedAt;
    private LocalDateTime createdDatetime;
}
