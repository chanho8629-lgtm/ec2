package com.app.bideo.controller.customerservice;

import com.app.bideo.dto.customerservice.CustomerServiceCreateRequestDTO;
import com.app.bideo.service.customerservice.CustomerServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customerservice")
@RequiredArgsConstructor
public class CustomerServiceAPIController {

    private final CustomerServiceService customerServiceService;

    @PostMapping
    public ResponseEntity<String> createInquiry(
            @RequestParam(required = false) Long memberId,
            @RequestBody CustomerServiceCreateRequestDTO requestDTO
    ) {
        customerServiceService.createInquiry(memberId, requestDTO);
        return ResponseEntity.ok("문의가 등록되었습니다.");
    }
}
