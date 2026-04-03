package com.app.bideo.dto.admin;

import com.app.bideo.dto.common.PageRequestDTO;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InquirySearchDTO extends PageRequestDTO {
    private String status;
    private Long memberId;
    private String category;
}
