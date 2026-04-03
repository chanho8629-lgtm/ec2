package com.app.bideo.controller.member;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.dto.admin.ReportCreateRequestDTO;
import com.app.bideo.service.admin.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportAPIController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @RequestBody ReportCreateRequestDTO requestDTO,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(reportService.create(userDetails.getId(), requestDTO));
    }
}
