package com.app.bideo.controller.admin;

import com.app.bideo.dto.admin.AdminAuctionDetailResponseDTO;
import com.app.bideo.dto.admin.AdminAuctionListResponseDTO;
import com.app.bideo.dto.admin.AdminSearchDTO;
import com.app.bideo.service.admin.AdminAuctionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/auctions")
@RequiredArgsConstructor
public class AdminAuctionAPIController {

    private final AdminAuctionService adminAuctionService;

    @GetMapping
    public Map<String, Object> list(AdminSearchDTO searchDTO) {
        return Map.of(
                "content", adminAuctionService.getAuctions(searchDTO),
                "totalElements", adminAuctionService.getAuctionCount(searchDTO)
        );
    }

    @GetMapping("/{id}")
    public AdminAuctionDetailResponseDTO detail(@PathVariable Long id) {
        return adminAuctionService.getAuctionDetail(id);
    }
}
