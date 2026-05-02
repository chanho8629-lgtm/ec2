package com.app.bideo.controller.admin;

import com.app.bideo.dto.admin.AdminPaymentDetailResponseDTO;
import com.app.bideo.dto.admin.AdminPaymentListResponseDTO;
import com.app.bideo.dto.admin.AdminSearchDTO;
import com.app.bideo.service.admin.AdminPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentAPIController implements AdminPaymentAPIControllerDocs {

    private final AdminPaymentService adminPaymentService;

    @GetMapping
    public Map<String, Object> list(AdminSearchDTO searchDTO) {
        return Map.of(
                "content", adminPaymentService.getPayments(searchDTO),
                "totalElements", adminPaymentService.getPaymentCount(searchDTO)
        );
    }

    @GetMapping("/{id}")
    public AdminPaymentDetailResponseDTO detail(@PathVariable Long id) {
        return adminPaymentService.getPaymentDetail(id);
    }
}
