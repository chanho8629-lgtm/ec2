package com.app.bideo.service.payment;

import com.app.bideo.domain.order.OrderVO;
import com.app.bideo.domain.payment.PaymentVO;
import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.dto.payment.PaymentRequestDTO;
import com.app.bideo.dto.payment.PaymentResponseDTO;
import com.app.bideo.repository.order.OrderDAO;
import com.app.bideo.repository.payment.PaymentDAO;
import com.app.bideo.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class PaymentService {

    private final PaymentDAO paymentDAO;
    private final OrderDAO orderDAO;
    private final NotificationService notificationService;

    private static final int PAGE_SIZE = 20;
    private static final double FEE_RATE = 0.10;

    public PaymentResponseDTO createPayment(Long buyerId, PaymentRequestDTO requestDTO) {
        OrderVO order = orderDAO.findByOrderCode(requestDTO.getOrderCode());
        if (order == null) {
            throw new IllegalArgumentException("주문을 찾을 수 없습니다.");
        }
        if (!order.getBuyerId().equals(buyerId)) {
            throw new IllegalArgumentException("결제 권한이 없습니다.");
        }
        if (!"PENDING_PAYMENT".equals(order.getStatus())) {
            throw new IllegalStateException("결제 대기 상태가 아닙니다.");
        }

        int originalAmount = order.getOriginalPrice();
        int totalFee = (int) (originalAmount * FEE_RATE);
        int totalPrice = originalAmount + totalFee;

        PaymentVO paymentVO = PaymentVO.builder()
                .paymentCode(UUID.randomUUID().toString().replace("-", "").substring(0, 20).toUpperCase())
                .orderCode(requestDTO.getOrderCode())
                .buyerId(buyerId)
                .sellerId(order.getSellerId())
                .workId(order.getWorkId())
                .auctionId(order.getAuctionId())
                .originalAmount(originalAmount)
                .totalPrice(totalPrice)
                .totalFee(totalFee)
                .paymentPurpose(requestDTO.getPaymentPurpose())
                .payMethod(requestDTO.getPayMethod())
                .cardId(requestDTO.getCardId())
                .status("PENDING")
                .build();

        paymentDAO.save(paymentVO);

        return paymentDAO.findById(paymentVO.getId())
                .orElseThrow(() -> new IllegalStateException("결제 생성 후 조회 실패"));
    }

    public PaymentResponseDTO completePayment(Long paymentId, Long memberId) {
        PaymentResponseDTO payment = paymentDAO.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("결제를 찾을 수 없습니다."));
        if (!"PENDING".equals(payment.getStatus())) {
            throw new IllegalStateException("대기 상태의 결제만 완료할 수 있습니다.");
        }

        paymentDAO.completePayment(paymentId);

        OrderVO order = orderDAO.findByOrderCode(payment.getOrderCode());
        if (order != null) {
            orderDAO.updateStatus(order.getId(), "PAID");

            notificationService.createNotification(
                    order.getSellerId(), order.getBuyerId(), "PAYMENT", "ORDER",
                    order.getId(), "결제가 완료되었습니다."
            );
        }

        return paymentDAO.findById(paymentId)
                .orElseThrow(() -> new IllegalStateException("결제 완료 후 조회 실패"));
    }

    public PaymentResponseDTO refundPayment(Long paymentId, Long memberId) {
        PaymentResponseDTO payment = paymentDAO.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("결제를 찾을 수 없습니다."));
        if (!"COMPLETED".equals(payment.getStatus())) {
            throw new IllegalStateException("완료된 결제만 환불할 수 있습니다.");
        }

        paymentDAO.refundPayment(paymentId);

        OrderVO order = orderDAO.findByOrderCode(payment.getOrderCode());
        if (order != null) {
            orderDAO.updateStatus(order.getId(), "REFUNDED");

            notificationService.createNotification(
                    order.getSellerId(), order.getBuyerId(), "PAYMENT", "ORDER",
                    order.getId(), "결제가 환불 처리되었습니다."
            );
        }

        return paymentDAO.findById(paymentId)
                .orElseThrow(() -> new IllegalStateException("환불 후 조회 실패"));
    }

    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentDetail(Long paymentId) {
        return paymentDAO.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("결제를 찾을 수 없습니다."));
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<PaymentResponseDTO> getMyPayments(Long buyerId, int page) {
        int offset = page * PAGE_SIZE;
        List<PaymentResponseDTO> content = paymentDAO.findByBuyerId(buyerId, offset, PAGE_SIZE);
        int total = paymentDAO.countByBuyerId(buyerId);

        return PageResponseDTO.<PaymentResponseDTO>builder()
                .content(content)
                .page(page + 1)
                .size(PAGE_SIZE)
                .totalElements((long) total)
                .totalPages((int) Math.ceil((double) total / PAGE_SIZE))
                .build();
    }
}
