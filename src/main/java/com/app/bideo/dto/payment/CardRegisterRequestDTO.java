package com.app.bideo.dto.payment;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardRegisterRequestDTO {
    private String cardCompany;
    private String cardNumber;
    private String cardNumberMasked;
    private String billingKey;
    private String cardPasswordTwoDigits;
    private String cardIdentityNo;
    private String cardExpireYear;
    private String cardExpireMonth;
    private Boolean isDefault;
}
