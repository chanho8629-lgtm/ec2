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
public class AdminRestrictionUpsertRequestDTO {
    private Long id;
    private Long memberId;
    private Long reportId;
    private String restrictionType;
    private String reason;
    private LocalDateTime endDatetime;
    private String previousMemberStatus;
}
