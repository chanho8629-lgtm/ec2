package com.app.bideo.domain.work;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkTagVO {
    private Long id;
    private Long workId;
    private Long tagId;
}
