package com.app.bideo.dto.order;

import com.app.bideo.dto.common.PageRequestDTO;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderSearchDTO extends PageRequestDTO {
    private String orderCode;
    private String orderType;
    private String status;
    private Long buyerId;
    private Long sellerId;
}
