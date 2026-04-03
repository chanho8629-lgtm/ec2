package com.app.bideo.domain.payment;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardVO {
    private Long id;
    private Long memberId;
    private String cardCompany;
    private String cardNumberMasked;
    private String billingKey;
    private Boolean isDefault;
    private LocalDateTime createdDatetime;
    private LocalDateTime deletedDatetime;
}
