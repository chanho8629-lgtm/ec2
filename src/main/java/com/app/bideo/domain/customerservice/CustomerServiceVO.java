package com.app.bideo.domain.customerservice;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerServiceVO {
    private Long id;
    private Long memberId;
    private String category;
    private String content;
    private String reply;
    private String status;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
}
