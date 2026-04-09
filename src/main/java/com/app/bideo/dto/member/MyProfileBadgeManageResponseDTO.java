package com.app.bideo.dto.member;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyProfileBadgeManageResponseDTO {
    private int maxDisplayCount;
    private List<Long> displayedBadgeIds;
    private List<MemberBadgeResponseDTO> ownedBadges;
}
