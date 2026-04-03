package com.app.bideo.dto.settlement;

import com.app.bideo.dto.common.PageRequestDTO;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SettlementSearchDTO extends PageRequestDTO {
    private Long memberId;
    private String status;
}
