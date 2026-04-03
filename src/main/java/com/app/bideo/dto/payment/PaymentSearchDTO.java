package com.app.bideo.dto.payment;

import com.app.bideo.dto.common.PageRequestDTO;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSearchDTO extends PageRequestDTO {
    private String paymentCode;
    private String orderCode;
    private String status;
    private String payMethod;
    private Long buyerId;
}
