package com.app.bideo.repository.payment;

import com.app.bideo.domain.payment.PaymentVO;
import com.app.bideo.dto.payment.PaymentResponseDTO;
import com.app.bideo.mapper.payment.PaymentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class PaymentDAO {

    private final PaymentMapper paymentMapper;

    public void save(PaymentVO vo) {
        paymentMapper.insertPayment(vo);
    }

    public Optional<PaymentResponseDTO> findById(Long paymentId) {
        return Optional.ofNullable(paymentMapper.selectById(paymentId));
    }

    public Optional<PaymentVO> findRawById(Long paymentId) {
        return Optional.ofNullable(paymentMapper.selectRawById(paymentId));
    }

    public Optional<PaymentResponseDTO> findByPaymentCode(String paymentCode) {
        return Optional.ofNullable(paymentMapper.selectByPaymentCode(paymentCode));
    }

    public Optional<PaymentResponseDTO> findPendingByBuyerAndAuction(Long buyerId, Long auctionId) {
        return Optional.ofNullable(paymentMapper.selectPendingByBuyerAndAuction(buyerId, auctionId));
    }

    public List<PaymentResponseDTO> findByBuyerId(Long buyerId, int offset, int limit) {
        return paymentMapper.selectByBuyerId(buyerId, offset, limit);
    }

    public int countByBuyerId(Long buyerId) {
        return paymentMapper.countByBuyerId(buyerId);
    }

    public void completePayment(Long paymentId) {
        paymentMapper.updateStatusCompleted(paymentId);
    }

    public void refundPayment(Long paymentId) {
        paymentMapper.updateStatusRefunded(paymentId);
    }

    public void updatePgReceiptId(Long paymentId, String pgReceiptId) {
        paymentMapper.updatePgReceiptId(paymentId, pgReceiptId);
    }

    public void updateOtherOpenByBuyerAndWork(Long buyerId, Long workId, Long excludePaymentId, String status) {
        paymentMapper.updateOtherOpenByBuyerAndWork(buyerId, workId, excludePaymentId, status);
    }
}
