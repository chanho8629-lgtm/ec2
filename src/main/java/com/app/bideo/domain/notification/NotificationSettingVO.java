package com.app.bideo.domain.notification;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSettingVO {
    private Long id;
    private Long memberId;
    private Boolean followNotify;
    private Boolean likeBookmarkNotify;
    private Boolean commentMentionNotify;
    private Boolean auctionNotify;
    private Boolean paymentSettlementNotify;
    private Boolean contestNotify;
    private Boolean pauseAll;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
}
