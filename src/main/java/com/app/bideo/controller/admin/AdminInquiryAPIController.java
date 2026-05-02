package com.app.bideo.controller.admin;

import com.app.bideo.dto.admin.InquiryResponseDTO;
import com.app.bideo.dto.admin.InquirySearchDTO;
import com.app.bideo.service.admin.AdminInquiryService;
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
@RequestMapping("/api/admin/inquiries")
@RequiredArgsConstructor
public class AdminInquiryAPIController {

    private final AdminInquiryService adminInquiryService;

    @GetMapping
    public List<InquiryResponseDTO> list(InquirySearchDTO searchDTO) {
        searchDTO.normalize();
        return adminInquiryService.getInquiries(searchDTO);
    }

    @GetMapping("/{id}")
    public InquiryResponseDTO detail(@PathVariable Long id) {
        return adminInquiryService.getInquiryDetail(id);
    }

    @PatchMapping("/{id}/reply")
    public ResponseEntity<Void> reply(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String reply = body == null ? null : body.get("reply");
        if (reply == null || reply.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        adminInquiryService.replyInquiry(id, reply);
        return ResponseEntity.ok().build();
    }
}
