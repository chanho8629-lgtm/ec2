package com.app.bideo.controller.dashboard;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.service.dashboard.DashboardService;
import com.app.bideo.service.payment.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardAPIController {

    private final DashboardService dashboardService;
    private final CardService cardService;

    // 대시보드 조회
    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "message", "로그인이 필요합니다.",
                    "dashboard", Map.of(),
                    "cards", List.of()
            ));
        }

        return ResponseEntity.ok(Map.of(
                "dashboard", dashboardService.getDashboard(userDetails.getId()),
                "cards", cardService.getMyCards(userDetails.getId()) == null ? List.of() : cardService.getMyCards(userDetails.getId())
        ));
    }
}
