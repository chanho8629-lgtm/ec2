package com.app.bideo.domain.member;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberTagVO {
    private Long id;
    private Long memberId;
    private Long tagId;
}
