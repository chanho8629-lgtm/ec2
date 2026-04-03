package com.app.bideo.repository.notification;

import com.app.bideo.domain.notification.NotificationVO;
import com.app.bideo.dto.notification.NotificationResponseDTO;
import com.app.bideo.mapper.notification.NotificationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class NotificationDAO {

    private final NotificationMapper notificationMapper;

    public void save(NotificationVO vo) {
        notificationMapper.insert(vo);
    }

    public List<NotificationResponseDTO> findByMemberId(Long memberId, int offset, int limit) {
        return notificationMapper.selectByMemberId(memberId, offset, limit);
    }

    public int findUnreadCount(Long memberId) {
        return notificationMapper.selectUnreadCount(memberId);
    }

    public void markAsRead(Long id, Long memberId) {
        notificationMapper.updateIsRead(id, memberId);
    }

    public void markAllAsRead(Long memberId) {
        notificationMapper.updateAllRead(memberId);
    }

    public void delete(Long id, Long memberId) {
        notificationMapper.deleteNotification(id, memberId);
    }
}
