package com.app.bideo.service.message;

import com.app.bideo.domain.message.MessageRoomVO;
import com.app.bideo.domain.message.MessageVO;
import com.app.bideo.dto.common.LikeToggleResponseDTO;
import com.app.bideo.dto.member.MemberListResponseDTO;
import com.app.bideo.dto.message.MessageRealtimeEventDTO;
import com.app.bideo.dto.message.MessageResponseDTO;
import com.app.bideo.dto.message.MessageRoomCreateRequestDTO;
import com.app.bideo.dto.message.MessageRoomResponseDTO;
import com.app.bideo.repository.member.MemberRepository;
import com.app.bideo.repository.message.MessageDAO;
import com.app.bideo.repository.message.MessageRoomDAO;
import com.app.bideo.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class MessageService {

    private static final int PAGE_SIZE = 50;
    private static final long EDITABLE_MINUTES = 5L;
    private static final String MESSAGE_TARGET_TYPE = "MESSAGE";

    private final MessageDAO messageDAO;
    private final MessageRoomDAO messageRoomDAO;
    private final MemberRepository memberRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<MessageRoomResponseDTO> getMyRooms(Long memberId) {
        List<MessageRoomResponseDTO> rooms = messageRoomDAO.findRoomsByMemberId(memberId);
        for (MessageRoomResponseDTO room : rooms) {
            room.setMembers(messageRoomDAO.findRoomMembers(room.getId(), memberId));
        }
        return rooms;
    }

    public MessageRoomResponseDTO createOrGetRoom(Long currentMemberId, MessageRoomCreateRequestDTO dto) {
        if (dto.getMemberIds() == null || dto.getMemberIds().isEmpty()) {
            throw new IllegalArgumentException("상대방을 선택해주세요.");
        }

        Long partnerId = dto.getMemberIds().get(0);
        if (partnerId.equals(currentMemberId)) {
            throw new IllegalArgumentException("자기 자신에게 메시지를 보낼 수 없습니다.");
        }

        if (memberRepository.findById(partnerId).isEmpty()) {
            throw new IllegalArgumentException("상대방을 찾을 수 없습니다.");
        }

        Long existingRoomId = messageRoomDAO.findExistingRoomId(currentMemberId, partnerId);
        if (existingRoomId != null) {
            return buildRoomResponse(existingRoomId, currentMemberId);
        }

        MessageRoomVO roomVO = new MessageRoomVO();
        messageRoomDAO.createRoom(roomVO);
        messageRoomDAO.addMember(roomVO.getId(), currentMemberId);
        messageRoomDAO.addMember(roomVO.getId(), partnerId);
        return buildRoomResponse(roomVO.getId(), currentMemberId);
    }

    @Transactional(readOnly = true)
    public List<MessageResponseDTO> getMessages(Long roomId, Long currentMemberId, int page) {
        validateRoomAccess(roomId, currentMemberId);
        return messageDAO.findByRoomId(roomId, currentMemberId, page * PAGE_SIZE, PAGE_SIZE);
    }

    public MessageResponseDTO sendMessage(Long roomId, Long senderId, String content, Long replyToMessageId) {
        validateRoomAccess(roomId, senderId);
        String normalizedContent = normalizeContent(content);
        validateReplyTarget(roomId, replyToMessageId);

        MessageVO messageVO = MessageVO.builder()
                .messageRoomId(roomId)
                .senderId(senderId)
                .replyToMessageId(replyToMessageId)
                .content(normalizedContent)
                .build();
        messageDAO.save(messageVO);
        messageRoomDAO.updateTimestamp(roomId);

        MessageResponseDTO response = loadMessageResponseOrThrow(messageVO.getId(), senderId);
        broadcast(roomId, "CREATED", response);
        return response;
    }

    public MessageResponseDTO updateMessage(Long roomId, Long messageId, Long memberId, String content) {
        validateRoomAccess(roomId, memberId);
        MessageVO message = loadMessageOrThrow(messageId);
        validateOwnedMessage(roomId, message, memberId);
        if (message.getDeletedDatetime() != null) {
            throw new IllegalArgumentException("삭제된 메시지는 수정할 수 없습니다.");
        }
        if (message.getCreatedDatetime() == null
                || message.getCreatedDatetime().isBefore(LocalDateTime.now().minusMinutes(EDITABLE_MINUTES))) {
            throw new IllegalArgumentException("메시지는 전송 후 5분 이내에만 수정할 수 있습니다.");
        }

        messageDAO.updateContent(messageId, normalizeContent(content));
        MessageResponseDTO response = loadMessageResponseOrThrow(messageId, memberId);
        broadcast(roomId, "UPDATED", response);
        return response;
    }

    public MessageResponseDTO deleteMessage(Long roomId, Long messageId, Long memberId) {
        validateRoomAccess(roomId, memberId);
        MessageVO message = loadMessageOrThrow(messageId);
        validateOwnedMessage(roomId, message, memberId);
        if (message.getDeletedDatetime() != null) {
            return loadMessageResponseOrThrow(messageId, memberId);
        }

        messageDAO.softDelete(messageId);
        messageRoomDAO.updateTimestamp(roomId);
        MessageResponseDTO response = loadMessageResponseOrThrow(messageId, memberId);
        broadcast(roomId, "DELETED", response);
        return response;
    }

    public LikeToggleResponseDTO toggleMessageLike(Long roomId, Long messageId, Long memberId) {
        validateRoomAccess(roomId, memberId);
        MessageVO message = loadMessageOrThrow(messageId);
        if (!roomId.equals(message.getMessageRoomId())) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }
        if (message.getDeletedDatetime() != null) {
            throw new IllegalArgumentException("삭제된 메시지에는 좋아요를 누를 수 없습니다.");
        }

        boolean liked = messageDAO.existsLike(memberId, messageId);
        if (liked) {
            messageDAO.deleteLike(memberId, messageId);
            messageDAO.decreaseLikeCount(messageId);
        } else {
            messageDAO.saveLike(memberId, messageId);
            messageDAO.increaseLikeCount(messageId);
            notificationService.createNotification(
                    message.getSenderId(), memberId, "LIKE", MESSAGE_TARGET_TYPE, messageId,
                    "메시지에 좋아요를 눌렀습니다."
            );
        }

        MessageResponseDTO response = loadMessageResponseOrThrow(messageId, memberId);
        broadcast(roomId, "LIKED", response);

        return LikeToggleResponseDTO.builder()
                .targetId(messageId)
                .targetType(MESSAGE_TARGET_TYPE)
                .likeCount(response.getLikeCount())
                .liked(!liked)
                .build();
    }

    public void markAsRead(Long roomId, Long memberId) {
        validateRoomAccess(roomId, memberId);
        messageDAO.markAllAsRead(roomId, memberId);
    }

    @Transactional(readOnly = true)
    public int getTotalUnreadCount(Long memberId) {
        return messageDAO.getTotalUnreadCount(memberId);
    }

    @Transactional(readOnly = true)
    public List<MemberListResponseDTO> searchMembers(String keyword, Long currentMemberId) {
        return memberRepository.searchByKeyword(keyword, currentMemberId, 20);
    }

    private void validateRoomAccess(Long roomId, Long memberId) {
        if (!messageRoomDAO.isMember(roomId, memberId)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }
    }

    private void validateReplyTarget(Long roomId, Long replyToMessageId) {
        if (replyToMessageId == null) {
            return;
        }

        MessageVO replyTarget = loadMessageOrThrow(replyToMessageId);
        if (!roomId.equals(replyTarget.getMessageRoomId())) {
            throw new IllegalArgumentException("같은 채팅방의 메시지에만 답장할 수 있습니다.");
        }
        if (replyTarget.getDeletedDatetime() != null) {
            throw new IllegalArgumentException("삭제된 메시지에는 답장할 수 없습니다.");
        }
    }

    private void validateOwnedMessage(Long roomId, MessageVO message, Long memberId) {
        if (!roomId.equals(message.getMessageRoomId())) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }
        if (!memberId.equals(message.getSenderId())) {
            throw new IllegalArgumentException("본인 메시지만 수정하거나 삭제할 수 있습니다.");
        }
    }

    private MessageVO loadMessageOrThrow(Long messageId) {
        return messageDAO.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("메시지를 찾을 수 없습니다."));
    }

    private MessageResponseDTO loadMessageResponseOrThrow(Long messageId, Long memberId) {
        return messageDAO.findResponseById(messageId, memberId)
                .orElseThrow(() -> new IllegalArgumentException("메시지를 찾을 수 없습니다."));
    }

    private String normalizeContent(String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("메시지 내용을 입력해주세요.");
        }
        String normalized = content.trim();
        if (normalized.length() > 255) {
            throw new IllegalArgumentException("메시지는 255자까지 입력할 수 있습니다.");
        }
        return normalized;
    }

    private void broadcast(Long roomId, String type, MessageResponseDTO message) {
        messagingTemplate.convertAndSend(
                "/topic/room." + roomId,
                MessageRealtimeEventDTO.builder()
                        .roomId(roomId)
                        .type(type)
                        .message(message)
                        .build()
        );
    }

    private MessageRoomResponseDTO buildRoomResponse(Long roomId, Long currentMemberId) {
        return MessageRoomResponseDTO.builder()
                .id(roomId)
                .members(messageRoomDAO.findRoomMembers(roomId, currentMemberId))
                .build();
    }
}
