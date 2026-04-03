package com.app.bideo.dto.payment;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardResponseDTO {
    private Long id;
    private String cardCompany;
    private String cardNumberMasked;
    private Boolean isDefault;
    private LocalDateTime createdDatetime;
}
