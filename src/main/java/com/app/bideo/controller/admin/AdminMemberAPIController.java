package com.app.bideo.controller.admin;

import com.app.bideo.dto.admin.AdminMemberDetailResponseDTO;
import com.app.bideo.dto.admin.AdminMemberListResponseDTO;
import com.app.bideo.dto.member.MemberSearchDTO;
import com.app.bideo.service.admin.AdminMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/members")
@RequiredArgsConstructor
public class AdminMemberAPIController {

    private final AdminMemberService adminMemberService;

    @GetMapping
    public List<AdminMemberListResponseDTO> list(MemberSearchDTO searchDTO) {
        return adminMemberService.getMembers(searchDTO);
    }

    @GetMapping("/{id}")
    public AdminMemberDetailResponseDTO detail(@PathVariable Long id) {
        return adminMemberService.getMemberDetail(id);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        adminMemberService.updateMemberStatus(id, body.get("status"));
        return ResponseEntity.ok().build();
    }
}
