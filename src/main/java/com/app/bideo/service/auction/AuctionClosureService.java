package com.app.bideo.service.auction;

import com.app.bideo.domain.auction.AuctionVO;
import com.app.bideo.domain.order.OrderVO;
import com.app.bideo.domain.payment.PaymentVO;
import com.app.bideo.dto.auction.BidBroadcastDTO;
import com.app.bideo.dto.auction.BidResponseDTO;
import com.app.bideo.repository.auction.AuctionDAO;
import com.app.bideo.repository.auction.BidDAO;
import com.app.bideo.repository.order.OrderDAO;
import com.app.bideo.repository.payment.PaymentDAO;
import com.app.bideo.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuctionClosureService {

    private final AuctionDAO auctionDAO;
    private final BidDAO bidDAO;
    private final OrderDAO orderDAO;
    private final PaymentDAO paymentDAO;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    private static final double FEE_RATE = 0.10;

    @Scheduled(fixedDelay = 10000)
    @Transactional(rollbackFor = Exception.class)
    public void closeExpiredAuctions() {
        List<AuctionVO> expiredAuctions = auctionDAO.findExpiredActiveAuctions();
        for (AuctionVO auction : expiredAuctions) {
            closeAuction(auction);
        }
    }

    private void closeAuction(AuctionVO auction) {
        BidResponseDTO winningBid = bidDAO.findHighestBid(auction.getId()).orElse(null);
        if (winningBid == null) {
            if (auctionDAO.updateStatusIfActive(auction.getId(), "CLOSED") > 0) {
                publishClosedAuction(auction, null, null);
            }
            return;
        }

        if (auctionDAO.updateWinnerIfActive(auction.getId(), winningBid.getMemberId(), winningBid.getBidPrice()) <= 0) {
            return;
        }

        PaymentVO pendingPayment = createPendingAuctionPayment(auction, winningBid);

        notificationService.createNotification(
                winningBid.getMemberId(),
                auction.getSellerId(),
                "AUCTION_END",
                "PAYMENT",
                pendingPayment.getId(),
                "경매에 낙찰되었습니다. 결제창에서 결제를 진행해주세요."
        );

        publishClosedAuction(auction, winningBid, pendingPayment.getId());
    }

    private void publishClosedAuction(AuctionVO auction, BidResponseDTO winningBid, Long paymentId) {
        BidBroadcastDTO event = BidBroadcastDTO.builder()
                .auctionId(auction.getId())
                .status(winningBid == null ? "CLOSED" : "SOLD")
                .winnerId(winningBid == null ? null : winningBid.getMemberId())
                .winnerNickname(winningBid == null ? null : winningBid.getMemberNickname())
                .finalPrice(winningBid == null ? null : winningBid.getBidPrice())
                .paymentId(paymentId)
                .build();

        messagingTemplate.convertAndSend("/topic/auction." + auction.getId(), event);
    }

    private PaymentVO createPendingAuctionPayment(AuctionVO auction, BidResponseDTO winningBid) {
        long originalPrice = winningBid.getBidPrice();
        long feeAmount = Math.round(originalPrice * FEE_RATE);
        long totalPrice = originalPrice + feeAmount;

        OrderVO order = OrderVO.builder()
                .orderCode(createCode())
                .buyerId(winningBid.getMemberId())
                .sellerId(auction.getSellerId())
                .workId(auction.getWorkId())
                .auctionId(auction.getId())
                .orderType("AUCTION")
                .licenseType(null)
                .originalPrice(originalPrice)
                .discountAmount(0L)
                .feeAmount(feeAmount)
                .totalPrice(totalPrice)
                .status("PENDING_PAYMENT")
                .build();
        orderDAO.save(order);

        PaymentVO payment = PaymentVO.builder()
                .paymentCode(createCode())
                .orderCode(order.getOrderCode())
                .buyerId(winningBid.getMemberId())
                .sellerId(auction.getSellerId())
                .workId(auction.getWorkId())
                .auctionId(auction.getId())
                .originalAmount(originalPrice)
                .totalPrice(totalPrice)
                .totalFee(feeAmount)
                .paymentPurpose("PURCHASE")
                .payMethod("BOOTPAY_BILLING")
                .status("PENDING")
                .build();
        paymentDAO.save(payment);
        return payment;
    }

    private String createCode() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 20).toUpperCase();
    }
}
