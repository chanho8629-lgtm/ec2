package com.app.bideo.dto.customerservice;

import com.app.bideo.dto.common.PageRequestDTO;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerServiceSearchDTO extends PageRequestDTO {
    private String status;
    private Long memberId;
    private String category;
}
