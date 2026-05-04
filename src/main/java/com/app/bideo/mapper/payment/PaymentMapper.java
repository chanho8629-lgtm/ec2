package com.app.bideo.mapper.payment;

import com.app.bideo.domain.payment.PaymentVO;
import com.app.bideo.dto.payment.PaymentResponseDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PaymentMapper {

    void insertPayment(PaymentVO vo);

    PaymentResponseDTO selectById(@Param("paymentId") Long paymentId);

    PaymentVO selectRawById(@Param("paymentId") Long paymentId);

    PaymentResponseDTO selectByPaymentCode(@Param("paymentCode") String paymentCode);

    PaymentResponseDTO selectPendingByBuyerAndAuction(@Param("buyerId") Long buyerId,
                                                      @Param("auctionId") Long auctionId);

    List<PaymentResponseDTO> selectByBuyerId(@Param("buyerId") Long buyerId,
                                              @Param("offset") int offset,
                                              @Param("limit") int limit);

    int countByBuyerId(@Param("buyerId") Long buyerId);

    void updateStatusCompleted(@Param("paymentId") Long paymentId);

    void updateStatusRefunded(@Param("paymentId") Long paymentId);

    void updatePgReceiptId(@Param("paymentId") Long paymentId, @Param("pgReceiptId") String pgReceiptId);

    void updateOtherOpenByBuyerAndWork(@Param("buyerId") Long buyerId,
                                       @Param("workId") Long workId,
                                       @Param("excludePaymentId") Long excludePaymentId,
                                       @Param("status") String status);
}
