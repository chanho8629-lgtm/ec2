package com.app.bideo.controller.interaction;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.dto.interaction.BookmarkRequestDTO;
import com.app.bideo.service.interaction.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkAPIController {

    private final BookmarkService bookmarkService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> toggleBookmark(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody BookmarkRequestDTO requestDTO) {
        Map<String, Object> result = bookmarkService.toggleBookmark(
                userDetails.getId(), requestDTO.getTargetType(), requestDTO.getTargetId());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> getMySavedItems(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Map<String, Object>> result = bookmarkService.getMySavedItems(userDetails.getId());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkBookmark(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam String targetType,
            @RequestParam Long targetId) {
        boolean bookmarked = bookmarkService.isBookmarked(userDetails.getId(), targetType, targetId);
        return ResponseEntity.ok(Map.of("bookmarked", bookmarked));
    }
}
