package com.app.bideo.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminRestrictionResponseDTO {
    private Long id;
    private Long memberId;
    private String memberNickname;
    private String memberEmail;
    private Long reportId;
    private String restrictionType;
    private String reason;
    private String status;
    private String previousMemberStatus;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private LocalDateTime releasedDatetime;
    private LocalDateTime createdDatetime;
}
