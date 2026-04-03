package com.app.bideo.dto.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaqUpdateRequestDTO {
    private String question;
    private String answer;
    private String category;
    private Integer sortOrder;
    private Boolean isActive;
}
