package com.app.bideo.dto.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSearchDTO {
    private String keyword;
    private String status;
    @Builder.Default
    private Integer page = 1;
    @Builder.Default
    private Integer size = 30;

    public int getOffset() {
        return (page - 1) * size;
    }

    public void normalize() {
        if (page == null || page < 1) page = 1;
        if (size == null || size < 1 || (size != 30 && size != 50 && size != 100)) size = 30;
    }
}
