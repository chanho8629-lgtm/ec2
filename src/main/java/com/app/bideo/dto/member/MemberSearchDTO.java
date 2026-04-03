package com.app.bideo.dto.member;

import com.app.bideo.dto.common.PageRequestDTO;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MemberSearchDTO extends PageRequestDTO {
    private String keyword;
    private String role;
    private String status;
    private Boolean creatorVerified;
}
