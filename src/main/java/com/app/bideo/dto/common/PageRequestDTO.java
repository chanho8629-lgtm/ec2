package com.app.bideo.dto.common;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageRequestDTO {
    private Integer page = 1;
    private Integer size = 20;
    private String sort;
    private String order;
}
