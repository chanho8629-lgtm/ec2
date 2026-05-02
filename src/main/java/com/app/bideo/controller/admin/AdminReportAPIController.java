package com.app.bideo.controller.admin;

import com.app.bideo.dto.admin.ReportResponseDTO;
import com.app.bideo.dto.admin.ReportSearchDTO;
import com.app.bideo.service.admin.AdminReportService;
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
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportAPIController {

    private final AdminReportService adminReportService;

    @GetMapping
    public Map<String, Object> list(ReportSearchDTO searchDTO) {
        return Map.of(
                "content", adminReportService.getReports(searchDTO),
                "totalElements", adminReportService.getReportCount(searchDTO)
        );
    }

    @GetMapping("/{id}")
    public ReportResponseDTO detail(@PathVariable Long id) {
        return adminReportService.getReportDetail(id);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body == null ? null : body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        String memo = body.get("memo");
        adminReportService.updateReportStatus(id, status, memo);
        return ResponseEntity.ok().build();
    }
}
