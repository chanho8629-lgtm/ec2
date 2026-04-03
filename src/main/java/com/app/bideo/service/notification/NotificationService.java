package com.app.bideo.service.notification;

import com.app.bideo.domain.notification.NotificationSettingVO;
import com.app.bideo.domain.notification.NotificationVO;
import com.app.bideo.dto.notification.NotificationResponseDTO;
import com.app.bideo.repository.notification.NotificationDAO;
import com.app.bideo.repository.notification.NotificationSettingDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class NotificationService {

    private final NotificationDAO notificationDAO;
    private final NotificationSettingDAO notificationSettingDAO;

    private static final int PAGE_SIZE = 20;

    public void createNotification(Long memberId, Long senderId, String notiType,
                                   String targetType, Long targetId, String message) {
        if (senderId != null && senderId.equals(memberId)) {
            return;
        }

        if (!isNotificationEnabled(memberId, notiType)) {
            return;
        }

        NotificationVO vo = NotificationVO.builder()
                .memberId(memberId)
                .senderId(senderId)
                .notiType(notiType)
                .targetType(targetType)
                .targetId(targetId)
                .message(message)
                .build();

        notificationDAO.save(vo);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getNotifications(Long memberId, int page) {
        int offset = page * PAGE_SIZE;
        return notificationDAO.findByMemberId(memberId, offset, PAGE_SIZE);
    }

    @Transactional(readOnly = true)
    public int getUnreadCount(Long memberId) {
        return notificationDAO.findUnreadCount(memberId);
    }

    public void markAsRead(Long id, Long memberId) {
        notificationDAO.markAsRead(id, memberId);
    }

    public void markAllAsRead(Long memberId) {
        notificationDAO.markAllAsRead(memberId);
    }

    public void deleteNotification(Long id, Long memberId) {
        notificationDAO.delete(id, memberId);
    }

    private boolean isNotificationEnabled(Long memberId, String notiType) {
        NotificationSettingVO setting = notificationSettingDAO.findByMemberId(memberId);
        if (setting == null) {
            return true;
        }
        if (Boolean.TRUE.equals(setting.getPauseAll())) {
            return false;
        }

        return switch (notiType) {
            case "FOLLOW" -> !Boolean.FALSE.equals(setting.getFollowNotify());
            case "LIKE", "BOOKMARK" -> !Boolean.FALSE.equals(setting.getLikeBookmarkNotify());
            case "COMMENT" -> !Boolean.FALSE.equals(setting.getCommentMentionNotify());
            case "BID", "AUCTION_END" -> !Boolean.FALSE.equals(setting.getAuctionNotify());
            case "PAYMENT", "SETTLEMENT" -> !Boolean.FALSE.equals(setting.getPaymentSettlementNotify());
            case "CONTEST_ENTRY", "CONTEST_WIN" -> !Boolean.FALSE.equals(setting.getContestNotify());
            default -> true;
        };
    }
}
