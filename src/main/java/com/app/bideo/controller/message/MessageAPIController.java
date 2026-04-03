package com.app.bideo.controller.message;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.dto.common.LikeToggleResponseDTO;
import com.app.bideo.dto.member.MemberListResponseDTO;
import com.app.bideo.dto.message.MessageResponseDTO;
import com.app.bideo.dto.message.MessageRoomCreateRequestDTO;
import com.app.bideo.dto.message.MessageRoomResponseDTO;
import com.app.bideo.dto.message.MessageSendRequestDTO;
import com.app.bideo.dto.message.MessageUpdateRequestDTO;
import jakarta.validation.Valid;
import com.app.bideo.service.message.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageAPIController {

    private final MessageService messageService;

    @GetMapping("/rooms")
    public ResponseEntity<List<MessageRoomResponseDTO>> getMyRooms(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<MessageRoomResponseDTO> rooms = messageService.getMyRooms(userDetails.getId());
        return ResponseEntity.ok(rooms);
    }

    @PostMapping("/rooms")
    public ResponseEntity<MessageRoomResponseDTO> createOrGetRoom(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody MessageRoomCreateRequestDTO dto) {
        MessageRoomResponseDTO room = messageService.createOrGetRoom(userDetails.getId(), dto);
        return ResponseEntity.ok(room);
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<List<MessageResponseDTO>> getMessages(
            @PathVariable Long roomId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page) {
        List<MessageResponseDTO> messages = messageService.getMessages(roomId, userDetails.getId(), page);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/rooms/{roomId}/send")
    public ResponseEntity<MessageResponseDTO> sendMessage(
            @PathVariable Long roomId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody MessageSendRequestDTO dto) {
        MessageResponseDTO message = messageService.sendMessage(
                roomId,
                userDetails.getId(),
                dto.getContent(),
                dto.getReplyToMessageId()
        );
        return ResponseEntity.ok(message);
    }

    @PatchMapping("/rooms/{roomId}/messages/{messageId}")
    public ResponseEntity<MessageResponseDTO> updateMessage(
            @PathVariable Long roomId,
            @PathVariable Long messageId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody MessageUpdateRequestDTO dto) {
        return ResponseEntity.ok(
                messageService.updateMessage(roomId, messageId, userDetails.getId(), dto.getContent())
        );
    }

    @DeleteMapping("/rooms/{roomId}/messages/{messageId}")
    public ResponseEntity<MessageResponseDTO> deleteMessage(
            @PathVariable Long roomId,
            @PathVariable Long messageId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(messageService.deleteMessage(roomId, messageId, userDetails.getId()));
    }

    @PostMapping("/rooms/{roomId}/messages/{messageId}/likes")
    public ResponseEntity<LikeToggleResponseDTO> toggleMessageLike(
            @PathVariable Long roomId,
            @PathVariable Long messageId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(messageService.toggleMessageLike(roomId, messageId, userDetails.getId()));
    }

    @PatchMapping("/rooms/{roomId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long roomId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        messageService.markAsRead(roomId, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        int count = messageService.getTotalUnreadCount(userDetails.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/search-members")
    public ResponseEntity<List<MemberListResponseDTO>> searchMembers(
            @RequestParam String keyword,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<MemberListResponseDTO> members = messageService.searchMembers(keyword, userDetails.getId());
        return ResponseEntity.ok(members);
    }
}
