package com.app.bideo.dto.payment;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BootpayBillingCardResultDTO {
    private String billingKey;
    private String billingReceiptId;
    private String cardCompany;
    private String cardNumberMasked;
    private String billingMethod;
    private String billingStatus;
}
