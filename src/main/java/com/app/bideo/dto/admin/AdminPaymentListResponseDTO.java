package com.app.bideo.dto.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminPaymentListResponseDTO {
    private Long id;
    private String orderCode;
    private String buyerName;
    private String sellerName;
    private String orderType;
    private String workTitle;
    private Integer totalPrice;
    private String paidAt;
    private String status;
}
