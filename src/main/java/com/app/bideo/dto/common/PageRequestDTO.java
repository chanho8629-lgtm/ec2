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

    public int getOffset() {
        int p = page == null || page < 1 ? 1 : page;
        int s = size == null || size < 1 ? 20 : size;
        return (p - 1) * s;
    }

    public void normalize() {
        if (page == null || page < 1) page = 1;
        if (size == null || size < 1 || (size != 30 && size != 50 && size != 100)) size = 30;
    }
}
