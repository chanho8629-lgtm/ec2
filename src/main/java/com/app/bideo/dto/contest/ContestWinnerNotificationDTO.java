package com.app.bideo.dto.contest;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContestWinnerNotificationDTO {
    private Long contestId;
    private Long contestOwnerId;
    private Long winnerMemberId;
    private Long winnerWorkId;
}
