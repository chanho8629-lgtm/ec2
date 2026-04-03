package com.app.bideo.dto.member;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlockResponseDTO {
    private Long id;
    private Long blockedId;
    private String nickname;
    private String profileImage;
    private LocalDateTime createdDatetime;
}
