package com.app.bideo.dto.dashboard;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DashboardNoticeSummaryDTO {
    private Integer receivedBookmarkCount;
    private Integer unreadNotificationCount;
    private Integer auctionWishlistCount;
}
