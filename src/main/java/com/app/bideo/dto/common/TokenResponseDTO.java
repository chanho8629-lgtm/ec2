package com.app.bideo.dto.common;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenResponseDTO {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
}
