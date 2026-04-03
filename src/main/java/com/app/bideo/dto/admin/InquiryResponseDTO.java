package com.app.bideo.dto.admin;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryResponseDTO {
    private Long id;
    private Long memberId;
    private String memberNickname;
    private String memberEmail;
    private String category;
    private String content;
    private String reply;
    private String status;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
}