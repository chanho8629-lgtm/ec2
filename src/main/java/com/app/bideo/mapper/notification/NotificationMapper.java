package com.app.bideo.mapper.notification;

import com.app.bideo.domain.notification.NotificationVO;
import com.app.bideo.dto.notification.NotificationResponseDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NotificationMapper {
    void insert(NotificationVO notificationVO);

    List<NotificationResponseDTO> selectByMemberId(@Param("memberId") Long memberId,
                                                    @Param("offset") int offset,
                                                    @Param("limit") int limit);

    int selectUnreadCount(@Param("memberId") Long memberId);

    void updateIsRead(@Param("id") Long id, @Param("memberId") Long memberId);

    void updateAllRead(@Param("memberId") Long memberId);

    void deleteNotification(@Param("id") Long id, @Param("memberId") Long memberId);
}
