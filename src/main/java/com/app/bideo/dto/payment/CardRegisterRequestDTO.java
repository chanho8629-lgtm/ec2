package com.app.bideo.dto.payment;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardRegisterRequestDTO {
    private String cardCompany;
    private String cardNumberMasked;
    private String billingKey;
    private Boolean isDefault;
}
