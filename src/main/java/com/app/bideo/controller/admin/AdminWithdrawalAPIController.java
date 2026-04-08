package com.app.bideo.controller.admin;

import com.app.bideo.dto.admin.AdminSearchDTO;
import com.app.bideo.dto.admin.AdminWithdrawalDetailResponseDTO;
import com.app.bideo.dto.admin.AdminWithdrawalListResponseDTO;
import com.app.bideo.service.admin.AdminWithdrawalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.bideo.auth.member.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/withdrawals")
@RequiredArgsConstructor
public class AdminWithdrawalAPIController {

    private final AdminWithdrawalService adminWithdrawalService;

    private Long getCurrentAdminId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getId();
        }
        return null;
    }

    @GetMapping
    public Map<String, Object> list(AdminSearchDTO searchDTO) {
        return Map.of(
                "content", adminWithdrawalService.getWithdrawals(searchDTO),
                "totalElements", adminWithdrawalService.getWithdrawalCount(searchDTO)
        );
    }

    @GetMapping("/{id}")
    public AdminWithdrawalDetailResponseDTO detail(@PathVariable Long id) {
        return adminWithdrawalService.getWithdrawalDetail(id);
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Map<String, String>> approve(@PathVariable Long id) {
        try {
            Long adminId = getCurrentAdminId();
            if (adminId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "관리자 인증 정보가 없습니다."));
            }
            adminWithdrawalService.approveWithdrawal(id, adminId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Map<String, String>> reject(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            Long adminId = getCurrentAdminId();
            if (adminId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "관리자 인증 정보가 없습니다."));
            }
            adminWithdrawalService.rejectWithdrawal(id, body.get("reason"), adminId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
