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

    // dto에서 명시된(null 아닌) 필드만 적용 — 부분 업데이트로 not null 컬럼 보호
    public void updateSettings(Long memberId, NotificationSettingUpdateRequestDTO dto) {
        NotificationSettingVO vo = getOrCreateSetting(memberId);
        if (dto.getFollowNotify() != null) vo.setFollowNotify(dto.getFollowNotify());
        if (dto.getLikeBookmarkNotify() != null) vo.setLikeBookmarkNotify(dto.getLikeBookmarkNotify());
        if (dto.getCommentMentionNotify() != null) vo.setCommentMentionNotify(dto.getCommentMentionNotify());
        if (dto.getAuctionNotify() != null) vo.setAuctionNotify(dto.getAuctionNotify());
        if (dto.getPaymentSettlementNotify() != null) vo.setPaymentSettlementNotify(dto.getPaymentSettlementNotify());
        if (dto.getContestNotify() != null) vo.setContestNotify(dto.getContestNotify());
        if (dto.getPauseAll() != null) vo.setPauseAll(dto.getPauseAll());
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
