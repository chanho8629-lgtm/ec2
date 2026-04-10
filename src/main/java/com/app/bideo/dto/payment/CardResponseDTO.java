package com.app.bideo.dto.payment;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
// 이승민 - 대시보드 카드 수정 시 billingKey를 함께 전달하도록 응답 필드를 보강함.
public class CardResponseDTO {
    private Long id;
    private String cardCompany;
    private String cardNumberMasked;
    private String billingKey;
    private Boolean isDefault;
    private LocalDateTime createdDatetime;
}
