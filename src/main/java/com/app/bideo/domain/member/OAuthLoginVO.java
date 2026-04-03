package com.app.bideo.domain.member;

import com.app.bideo.common.enumeration.OAuthProvider;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OAuthLoginVO {
    private Long id;
    private Long memberId;
    private OAuthProvider provider;
    private String providerId;
    private LocalDateTime connectedAt;
}
