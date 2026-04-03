package com.app.bideo.controller.member;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.dto.member.FollowResponseDTO;
import com.app.bideo.service.member.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class FollowAPIController {

    private final FollowService followService;

    @PostMapping("/{id}/follow")
    public ResponseEntity<Map<String, Object>> toggleFollow(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Map<String, Object> result = followService.toggleFollow(userDetails.getId(), id);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/followers")
    public ResponseEntity<List<FollowResponseDTO>> getFollowers(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page) {
        Long currentMemberId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(followService.getFollowers(id, currentMemberId, page));
    }

    @GetMapping("/{id}/followings")
    public ResponseEntity<List<FollowResponseDTO>> getFollowings(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page) {
        Long currentMemberId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(followService.getFollowings(id, currentMemberId, page));
    }
}
