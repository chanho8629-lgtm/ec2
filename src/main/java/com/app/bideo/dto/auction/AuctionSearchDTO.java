package com.app.bideo.dto.auction;

import com.app.bideo.dto.common.PageRequestDTO;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuctionSearchDTO extends PageRequestDTO {
    private String keyword;
    private String status;
    private Long sellerId;
}
