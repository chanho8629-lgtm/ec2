package com.app.bideo.service.notification;

import com.app.bideo.domain.notification.NotificationSettingVO;
import com.app.bideo.dto.notification.NotificationSettingResponseDTO;
import com.app.bideo.dto.notification.NotificationSettingUpdateRequestDTO;
import com.app.bideo.repository.notification.NotificationSettingDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class NotificationSettingService {

    private final NotificationSettingDAO notificationSettingDAO;

    public NotificationSettingResponseDTO getSettings(Long memberId) {
        NotificationSettingVO vo = getOrCreateSetting(memberId);
        return NotificationSettingResponseDTO.builder()
                .id(vo.getId())
                .memberId(vo.getMemberId())
                .followNotify(vo.getFollowNotify())
                .likeBookmarkNotify(vo.getLikeBookmarkNotify())
                .commentMentionNotify(vo.getCommentMentionNotify())
                .auctionNotify(vo.getAuctionNotify())
                .paymentSettlementNotify(vo.getPaymentSettlementNotify())
                .contestNotify(vo.getContestNotify())
                .pauseAll(vo.getPauseAll())
                .build();
    }

    public void updateSettings(Long memberId, NotificationSettingUpdateRequestDTO dto) {
        NotificationSettingVO vo = getOrCreateSetting(memberId);
        vo.setFollowNotify(dto.getFollowNotify());
        vo.setLikeBookmarkNotify(dto.getLikeBookmarkNotify());
        vo.setCommentMentionNotify(dto.getCommentMentionNotify());
        vo.setAuctionNotify(dto.getAuctionNotify());
        vo.setPaymentSettlementNotify(dto.getPaymentSettlementNotify());
        vo.setContestNotify(dto.getContestNotify());
        vo.setPauseAll(dto.getPauseAll());
        notificationSettingDAO.update(vo);
    }

    NotificationSettingVO getOrCreateSetting(Long memberId) {
        NotificationSettingVO vo = notificationSettingDAO.findByMemberId(memberId);
        if (vo == null) {
            notificationSettingDAO.insertDefault(memberId);
            vo = notificationSettingDAO.findByMemberId(memberId);
        }
        return vo;
    }
}
