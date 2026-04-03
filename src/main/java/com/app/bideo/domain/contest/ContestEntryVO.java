package com.app.bideo.domain.contest;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContestEntryVO {
    private Long id;
    private Long contestId;
    private Long workId;
    private Long memberId;
    private String awardRank;
    private LocalDateTime submittedAt;
}
