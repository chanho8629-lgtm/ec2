package com.app.bideo.domain.contest;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContestTagVO {
    private Long id;
    private Long contestId;
    private Long tagId;
}
