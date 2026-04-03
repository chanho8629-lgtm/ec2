package com.app.bideo.dto.order;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderListResponseDTO {
    private Long id;
    private String orderCode;
    private String workTitle;
    private String workThumbnail;
    private Integer totalPrice;
    private String orderType;
    private String status;
    private LocalDateTime orderedAt;
}
