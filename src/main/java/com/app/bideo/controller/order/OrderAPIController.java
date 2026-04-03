package com.app.bideo.controller.order;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.dto.order.OrderCreateRequestDTO;
import com.app.bideo.dto.order.OrderDetailResponseDTO;
import com.app.bideo.dto.order.OrderListResponseDTO;
import com.app.bideo.service.order.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderAPIController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDetailResponseDTO> createOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody OrderCreateRequestDTO requestDTO) {
        return ResponseEntity.ok(orderService.createOrder(userDetails.getId(), requestDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDetailResponseDTO> getOrderDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(orderService.getOrderDetail(id, userDetails.getId()));
    }

    @GetMapping("/my")
    public ResponseEntity<PageResponseDTO<OrderListResponseDTO>> getMyOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(orderService.getMyOrders(userDetails.getId(), page));
    }

    @GetMapping("/sales")
    public ResponseEntity<PageResponseDTO<OrderListResponseDTO>> getSellerOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(orderService.getSellerOrders(userDetails.getId(), page));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        orderService.cancelOrder(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
