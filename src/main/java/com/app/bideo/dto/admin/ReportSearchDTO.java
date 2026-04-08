package com.app.bideo.dto.admin;

import com.app.bideo.dto.common.PageRequestDTO;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReportSearchDTO extends PageRequestDTO {
    private String keyword;
    private String targetType;
    private String status;
    private Long reporterId;
}
