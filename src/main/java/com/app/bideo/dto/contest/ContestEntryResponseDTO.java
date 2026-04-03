package com.app.bideo.dto.contest;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContestEntryResponseDTO {
    private Long id;
    private Long contestId;
    private Long workId;
    private String workTitle;
    private String workThumbnail;
    private Long memberId;
    private String memberNickname;
    private String awardRank;
    private LocalDateTime submittedAt;
}
