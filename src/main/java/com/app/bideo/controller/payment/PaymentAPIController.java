package com.app.bideo.controller.payment;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.dto.payment.BootpayConfirmRequestDTO;
import com.app.bideo.dto.payment.PaymentRequestDTO;
import com.app.bideo.dto.payment.PaymentResponseDTO;
import com.app.bideo.service.payment.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentAPIController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponseDTO> createPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody PaymentRequestDTO requestDTO) {
        return ResponseEntity.ok(paymentService.createPayment(userDetails.getId(), requestDTO));
    }

    @PostMapping("/easy")
    public ResponseEntity<PaymentResponseDTO> payWithRegisteredCard(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody PaymentRequestDTO requestDTO) {
        return ResponseEntity.ok(paymentService.payWithRegisteredCard(userDetails.getId(), requestDTO));
    }

    @PostMapping("/{id}/easy")
    public ResponseEntity<PaymentResponseDTO> payPendingWithRegisteredCard(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(paymentService.payPendingWithRegisteredCard(userDetails.getId(), id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponseDTO> getPaymentDetail(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentDetail(id));
    }

    @GetMapping("/pending/auction/{auctionId}")
    public ResponseEntity<PaymentResponseDTO> getPendingAuctionPayment(
            @PathVariable Long auctionId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(paymentService.getPendingAuctionPayment(userDetails.getId(), auctionId));
    }

    @GetMapping("/my")
    public ResponseEntity<PageResponseDTO<PaymentResponseDTO>> getMyPayments(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(paymentService.getMyPayments(userDetails.getId(), page));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<PaymentResponseDTO> completePayment(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(paymentService.completePayment(id, userDetails.getId()));
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<PaymentResponseDTO> refundPayment(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(paymentService.refundPayment(id, userDetails.getId()));
    }

    @PostMapping("/bootpay/confirm")
    public ResponseEntity<PaymentResponseDTO> confirmBootpayPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody BootpayConfirmRequestDTO requestDTO) {
        return ResponseEntity.ok(paymentService.confirmBootpayPayment(userDetails.getId(), requestDTO));
    }
}
