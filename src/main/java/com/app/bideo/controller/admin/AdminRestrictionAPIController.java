package com.app.bideo.controller.admin;

import com.app.bideo.dto.admin.AdminRestrictionResponseDTO;
import com.app.bideo.dto.admin.AdminRestrictionSearchDTO;
import com.app.bideo.dto.admin.AdminRestrictionUpsertRequestDTO;
import com.app.bideo.service.admin.AdminRestrictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/restrictions")
@RequiredArgsConstructor
public class AdminRestrictionAPIController implements AdminRestrictionAPIControllerDocs {

    private final AdminRestrictionService adminRestrictionService;

    @GetMapping
    public List<AdminRestrictionResponseDTO> list(AdminRestrictionSearchDTO searchDTO) {
        searchDTO.normalize();
        return adminRestrictionService.getRestrictions(searchDTO);
    }

    @GetMapping("/{id}")
    public AdminRestrictionResponseDTO detail(@PathVariable Long id) {
        return adminRestrictionService.getRestriction(id);
    }

    @GetMapping("/active/member/{memberId}")
    public ResponseEntity<AdminRestrictionResponseDTO> activeByMember(@PathVariable Long memberId) {
        return adminRestrictionService.getActiveRestrictionByMemberId(memberId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping
    public ResponseEntity<Map<String, Long>> create(@RequestBody AdminRestrictionUpsertRequestDTO requestDTO) {
        Long id = adminRestrictionService.createRestriction(requestDTO);
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody AdminRestrictionUpsertRequestDTO requestDTO) {
        adminRestrictionService.updateRestriction(id, requestDTO);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/release")
    public ResponseEntity<Void> release(@PathVariable Long id) {
        adminRestrictionService.releaseRestriction(id);
        return ResponseEntity.ok().build();
    }
}
