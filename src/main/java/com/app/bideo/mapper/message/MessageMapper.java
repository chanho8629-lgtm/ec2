package com.app.bideo.mapper.message;

import com.app.bideo.domain.message.MessageVO;
import com.app.bideo.dto.message.MessageResponseDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MessageMapper {
    void insert(MessageVO messageVO);

    List<MessageResponseDTO> selectByRoomId(@Param("roomId") Long roomId,
                                            @Param("memberId") Long memberId,
                                            @Param("offset") int offset,
                                            @Param("limit") int limit);

    MessageVO selectMessageById(@Param("messageId") Long messageId);

    MessageResponseDTO selectMessageResponseById(@Param("messageId") Long messageId,
                                                 @Param("memberId") Long memberId);

    void updateMessageContent(@Param("messageId") Long messageId,
                              @Param("content") String content);

    void softDeleteMessage(@Param("messageId") Long messageId);

    void updateReadByRoomId(@Param("roomId") Long roomId,
                            @Param("memberId") Long memberId);

    int selectTotalUnreadCount(@Param("memberId") Long memberId);

    boolean existsMessageLike(@Param("memberId") Long memberId,
                              @Param("messageId") Long messageId);

    void insertMessageLike(@Param("memberId") Long memberId,
                           @Param("messageId") Long messageId);

    void deleteMessageLike(@Param("memberId") Long memberId,
                           @Param("messageId") Long messageId);

    void increaseMessageLikeCount(@Param("messageId") Long messageId);

    void decreaseMessageLikeCount(@Param("messageId") Long messageId);
}
