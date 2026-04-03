package com.app.bideo.dto.contest;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContestEntryRequestDTO {
    private Long contestId;
    private Long workId;
}
