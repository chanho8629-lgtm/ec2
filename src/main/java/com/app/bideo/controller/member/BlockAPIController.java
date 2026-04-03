package com.app.bideo.controller.member;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.service.member.BlockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class BlockAPIController {

    private final BlockService blockService;

    @PostMapping("/{id}/block")
    public ResponseEntity<Map<String, Object>> block(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(blockService.block(userDetails.getId(), id));
    }
}
