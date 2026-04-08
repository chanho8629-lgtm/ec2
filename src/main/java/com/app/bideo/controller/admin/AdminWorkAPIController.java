package com.app.bideo.controller.admin;

import com.app.bideo.dto.admin.AdminSearchDTO;
import com.app.bideo.dto.admin.AdminWorkDetailResponseDTO;
import com.app.bideo.dto.admin.AdminWorkListResponseDTO;
import com.app.bideo.service.admin.AdminWorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/works")
@RequiredArgsConstructor
public class AdminWorkAPIController {

    private final AdminWorkService adminWorkService;

    @GetMapping
    public Map<String, Object> list(AdminSearchDTO searchDTO) {
        return Map.of(
                "content", adminWorkService.getWorks(searchDTO),
                "totalElements", adminWorkService.getWorkCount(searchDTO)
        );
    }

    @GetMapping("/{id}")
    public AdminWorkDetailResponseDTO detail(@PathVariable Long id) {
        return adminWorkService.getWorkDetail(id);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        adminWorkService.updateWorkStatus(id, body.get("status"));
        return ResponseEntity.ok().build();
    }
}
