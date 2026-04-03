package com.app.bideo.repository.notification;

import com.app.bideo.domain.notification.NotificationSettingVO;
import com.app.bideo.mapper.notification.NotificationSettingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class NotificationSettingDAO {

    private final NotificationSettingMapper notificationSettingMapper;

    public NotificationSettingVO findByMemberId(Long memberId) {
        return notificationSettingMapper.selectByMemberId(memberId);
    }

    public void insertDefault(Long memberId) {
        notificationSettingMapper.insertDefault(memberId);
    }

    public void update(NotificationSettingVO vo) {
        notificationSettingMapper.updateSetting(vo);
    }
}
