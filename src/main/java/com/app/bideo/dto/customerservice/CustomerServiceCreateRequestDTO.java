package com.app.bideo.dto.customerservice;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerServiceCreateRequestDTO {
    private String category;
    private String content;
}
