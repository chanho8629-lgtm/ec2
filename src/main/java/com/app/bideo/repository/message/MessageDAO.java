package com.app.bideo.repository.message;

import com.app.bideo.domain.message.MessageVO;
import com.app.bideo.dto.message.MessageResponseDTO;
import com.app.bideo.mapper.message.MessageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MessageDAO {

    private final MessageMapper messageMapper;

    public void save(MessageVO messageVO) {
        messageMapper.insert(messageVO);
    }

    public List<MessageResponseDTO> findByRoomId(Long roomId, Long memberId, int offset, int limit) {
        return messageMapper.selectByRoomId(roomId, memberId, offset, limit);
    }

    public Optional<MessageVO> findById(Long messageId) {
        return Optional.ofNullable(messageMapper.selectMessageById(messageId));
    }

    public Optional<MessageResponseDTO> findResponseById(Long messageId, Long memberId) {
        return Optional.ofNullable(messageMapper.selectMessageResponseById(messageId, memberId));
    }

    public void updateContent(Long messageId, String content) {
        messageMapper.updateMessageContent(messageId, content);
    }

    public void softDelete(Long messageId) {
        messageMapper.softDeleteMessage(messageId);
    }

    public void markAllAsRead(Long roomId, Long memberId) {
        messageMapper.updateReadByRoomId(roomId, memberId);
    }

    public int getTotalUnreadCount(Long memberId) {
        return messageMapper.selectTotalUnreadCount(memberId);
    }

    public boolean existsLike(Long memberId, Long messageId) {
        return messageMapper.existsMessageLike(memberId, messageId);
    }

    public void saveLike(Long memberId, Long messageId) {
        messageMapper.insertMessageLike(memberId, messageId);
    }

    public void deleteLike(Long memberId, Long messageId) {
        messageMapper.deleteMessageLike(memberId, messageId);
    }

    public void increaseLikeCount(Long messageId) {
        messageMapper.increaseMessageLikeCount(messageId);
    }

    public void decreaseLikeCount(Long messageId) {
        messageMapper.decreaseMessageLikeCount(messageId);
    }
}
