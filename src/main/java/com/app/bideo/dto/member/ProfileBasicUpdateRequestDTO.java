package com.app.bideo.dto.member;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileBasicUpdateRequestDTO {
    private String realName;
    private String bio;
    private String profileImage;
    private String bannerImage;
    private String phoneNumber;
}
