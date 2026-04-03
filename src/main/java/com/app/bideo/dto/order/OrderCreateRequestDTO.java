package com.app.bideo.dto.order;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreateRequestDTO {
    private Long workId;
    private Long auctionId;
    private String orderType;
    private String licenseType;
}
