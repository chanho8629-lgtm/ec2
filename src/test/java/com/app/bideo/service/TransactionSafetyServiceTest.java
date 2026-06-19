package com.app.bideo.service;

import com.app.bideo.domain.auction.AuctionVO;
import com.app.bideo.domain.payment.PaymentVO;
import com.app.bideo.dto.auction.BidRequestDTO;
import com.app.bideo.dto.payment.BootpayConfirmRequestDTO;
import com.app.bideo.repository.auction.AuctionDAO;
import com.app.bideo.repository.auction.BidDAO;
import com.app.bideo.repository.gallery.GalleryDAO;
import com.app.bideo.repository.order.OrderDAO;
import com.app.bideo.repository.payment.CardDAO;
import com.app.bideo.repository.payment.PaymentDAO;
import com.app.bideo.repository.work.WorkDAO;
import com.app.bideo.service.auction.BidCommandService;
import com.app.bideo.service.notification.NotificationService;
import com.app.bideo.service.payment.BootpayClient;
import com.app.bideo.service.payment.BootpayService;
import com.app.bideo.service.payment.PaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.CacheManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionSafetyServiceTest {

    @Mock BidDAO bidDAO;
    @Mock AuctionDAO auctionDAO;
    @Mock NotificationService notificationService;
    @InjectMocks BidCommandService bidCommandService;

    @Mock PaymentDAO paymentDAO;
    @Mock OrderDAO orderDAO;
    @Mock CardDAO cardDAO;
    @Mock BootpayService bootpayService;
    @Mock WorkDAO workDAO;
    @Mock GalleryDAO galleryDAO;
    @Mock BootpayClient bootpayClient;
    @Mock CacheManager cacheManager;
    @InjectMocks PaymentService paymentService;

    @Test
    void bidReadsAuctionWithDatabaseRowLock() {
        AuctionVO auction = AuctionVO.builder()
                .id(10L)
                .workId(20L)
                .sellerId(1L)
                .currentPrice(10_000L)
                .closingAt(LocalDateTime.now().plusHours(1))
                .status("ACTIVE")
                .build();
        when(auctionDAO.findRawByIdForUpdate(10L)).thenReturn(auction);
        when(bidDAO.findHighestBid(10L)).thenReturn(Optional.empty());
        when(bidDAO.findBidderIds(10L)).thenReturn(List.of(2L));

        bidCommandService.placeBid(2L, BidRequestDTO.builder()
                .auctionId(10L)
                .bidPrice(11_000L)
                .build());

        verify(auctionDAO).findRawByIdForUpdate(10L);
        verify(auctionDAO, never()).findRawById(10L);
        verify(bidDAO).clearPreviousWinning(10L);
        verify(bidDAO).save(any());
    }

    @Test
    void reusedBootpayReceiptIsRejectedBeforePaymentCompletion() {
        PaymentVO payment = PaymentVO.builder()
                .id(30L)
                .paymentCode("PAYMENT-CODE")
                .buyerId(2L)
                .totalPrice(55_000L)
                .status("PENDING")
                .build();
        when(paymentDAO.findRawById(30L)).thenReturn(Optional.of(payment));
        when(bootpayClient.getReceipt("receipt-used")).thenReturn(
                new ObjectMapper().createObjectNode()
                        .put("price", 55_000)
                        .put("status", 1)
                        .put("order_id", "PAYMENT-CODE")
        );
        when(paymentDAO.existsPgReceiptIdForOtherPayment("receipt-used", 30L)).thenReturn(true);

        assertThatThrownBy(() -> paymentService.confirmBootpayPayment(
                2L,
                BootpayConfirmRequestDTO.builder()
                        .paymentId(30L)
                        .receiptId("receipt-used")
                        .build()
        )).isInstanceOf(IllegalStateException.class)
                .hasMessage("이미 사용된 부트페이 영수증입니다.");

        verify(paymentDAO, never()).updatePgReceiptId(any(), any());
        verify(paymentDAO, never()).completePayment(any());
    }
}
