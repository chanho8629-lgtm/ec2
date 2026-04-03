package com.app.bideo.mapper.notification;

import com.app.bideo.domain.notification.NotificationSettingVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface NotificationSettingMapper {
    NotificationSettingVO selectByMemberId(@Param("memberId") Long memberId);

    void insertDefault(@Param("memberId") Long memberId);

    void updateSetting(NotificationSettingVO vo);
}
