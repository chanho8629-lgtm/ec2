package com.app.bideo.dto.notification;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSettingResponseDTO {
    private Long id;
    private Long memberId;
    private Boolean followNotify;
    private Boolean likeBookmarkNotify;
    private Boolean commentMentionNotify;
    private Boolean auctionNotify;
    private Boolean paymentSettlementNotify;
    private Boolean contestNotify;
    private Boolean pauseAll;
}
