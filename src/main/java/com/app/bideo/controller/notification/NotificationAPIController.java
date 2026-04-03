package com.app.bideo.controller.notification;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.dto.notification.NotificationResponseDTO;
import com.app.bideo.dto.notification.NotificationSettingResponseDTO;
import com.app.bideo.dto.notification.NotificationSettingUpdateRequestDTO;
import com.app.bideo.service.notification.NotificationService;
import com.app.bideo.service.notification.NotificationSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationAPIController {

    private final NotificationService notificationService;
    private final NotificationSettingService notificationSettingService;

    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page) {
        List<NotificationResponseDTO> notifications =
                notificationService.getNotifications(userDetails.getId(), page);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        int count = notificationService.getUnreadCount(userDetails.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.markAsRead(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.markAllAsRead(userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.deleteNotification(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/settings")
    public ResponseEntity<NotificationSettingResponseDTO> getSettings(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        NotificationSettingResponseDTO settings =
                notificationSettingService.getSettings(userDetails.getId());
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/settings")
    public ResponseEntity<Void> updateSettings(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody NotificationSettingUpdateRequestDTO requestDTO) {
        notificationSettingService.updateSettings(userDetails.getId(), requestDTO);
        return ResponseEntity.ok().build();
    }
}
