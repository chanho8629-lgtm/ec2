package com.app.bideo.dto.customerservice;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerServiceResponseDTO {
    private Long id;
    private Long memberId;
    private String memberNickname;
    private String category;
    private String content;
    private String reply;
    private String status;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
}
