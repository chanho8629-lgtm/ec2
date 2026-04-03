package com.app.bideo.service.order;

import com.app.bideo.domain.auction.AuctionVO;
import com.app.bideo.domain.order.OrderVO;
import com.app.bideo.dto.order.OrderCreateRequestDTO;
import com.app.bideo.dto.order.OrderDetailResponseDTO;
import com.app.bideo.dto.order.OrderListResponseDTO;
import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.dto.work.WorkDTO;
import com.app.bideo.repository.auction.AuctionDAO;
import com.app.bideo.repository.order.OrderDAO;
import com.app.bideo.repository.work.WorkDAO;
import com.app.bideo.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class OrderService {

    private final OrderDAO orderDAO;
    private final WorkDAO workDAO;
    private final AuctionDAO auctionDAO;
    private final NotificationService notificationService;

    private static final int PAGE_SIZE = 20;
    private static final double FEE_RATE = 0.10;

    public OrderDetailResponseDTO createOrder(Long buyerId, OrderCreateRequestDTO requestDTO) {
        Long sellerId;
        Integer originalPrice;
        String licenseType = requestDTO.getLicenseType();

        if ("AUCTION".equals(requestDTO.getOrderType())) {
            AuctionVO auction = auctionDAO.findRawById(requestDTO.getAuctionId());
            if (auction == null) {
                throw new IllegalArgumentException("경매를 찾을 수 없습니다.");
            }
            if (!"SOLD".equals(auction.getStatus())) {
                throw new IllegalStateException("낙찰되지 않은 경매입니다.");
            }
            if (!auction.getWinnerId().equals(buyerId)) {
                throw new IllegalArgumentException("낙찰자만 주문할 수 있습니다.");
            }
            sellerId = auction.getSellerId();
            originalPrice = auction.getFinalPrice();
            requestDTO.setWorkId(auction.getWorkId());
        } else {
            WorkDTO work = workDAO.findById(requestDTO.getWorkId())
                    .orElseThrow(() -> new IllegalArgumentException("작품을 찾을 수 없습니다."));
            if (work.getMemberId().equals(buyerId)) {
                throw new IllegalArgumentException("자신의 작품은 구매할 수 없습니다.");
            }
            sellerId = work.getMemberId();
            originalPrice = work.getPrice();
            if (licenseType == null) {
                licenseType = work.getLicenseType();
            }
        }

        int feeAmount = (int) (originalPrice * FEE_RATE);
        int totalPrice = originalPrice + feeAmount;

        OrderVO orderVO = OrderVO.builder()
                .orderCode(UUID.randomUUID().toString().replace("-", "").substring(0, 20).toUpperCase())
                .buyerId(buyerId)
                .sellerId(sellerId)
                .workId(requestDTO.getWorkId())
                .auctionId(requestDTO.getAuctionId())
                .orderType(requestDTO.getOrderType())
                .licenseType(licenseType)
                .originalPrice(originalPrice)
                .discountAmount(0)
                .feeAmount(feeAmount)
                .totalPrice(totalPrice)
                .status("PENDING_PAYMENT")
                .build();

        orderDAO.save(orderVO);

        notificationService.createNotification(
                sellerId, buyerId, "ORDER", "ORDER",
                orderVO.getId(), "새로운 주문이 접수되었습니다."
        );

        return orderDAO.findById(orderVO.getId())
                .orElseThrow(() -> new IllegalStateException("주문 생성 후 조회 실패"));
    }

    @Transactional(readOnly = true)
    public OrderDetailResponseDTO getOrderDetail(Long orderId, Long memberId) {
        OrderDetailResponseDTO order = orderDAO.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));
        if (!order.getBuyerId().equals(memberId) && !order.getSellerId().equals(memberId)) {
            throw new IllegalArgumentException("주문 조회 권한이 없습니다.");
        }
        return order;
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<OrderListResponseDTO> getMyOrders(Long buyerId, int page) {
        int offset = page * PAGE_SIZE;
        List<OrderListResponseDTO> content = orderDAO.findByBuyerId(buyerId, offset, PAGE_SIZE);
        int total = orderDAO.countByBuyerId(buyerId);

        return PageResponseDTO.<OrderListResponseDTO>builder()
                .content(content)
                .page(page + 1)
                .size(PAGE_SIZE)
                .totalElements((long) total)
                .totalPages((int) Math.ceil((double) total / PAGE_SIZE))
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<OrderListResponseDTO> getSellerOrders(Long sellerId, int page) {
        int offset = page * PAGE_SIZE;
        List<OrderListResponseDTO> content = orderDAO.findBySellerId(sellerId, offset, PAGE_SIZE);
        int total = orderDAO.countBySellerId(sellerId);

        return PageResponseDTO.<OrderListResponseDTO>builder()
                .content(content)
                .page(page + 1)
                .size(PAGE_SIZE)
                .totalElements((long) total)
                .totalPages((int) Math.ceil((double) total / PAGE_SIZE))
                .build();
    }

    public void cancelOrder(Long orderId, Long memberId) {
        OrderDetailResponseDTO order = orderDAO.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));
        if (!order.getBuyerId().equals(memberId)) {
            throw new IllegalArgumentException("주문 취소 권한이 없습니다.");
        }
        if (!"PENDING_PAYMENT".equals(order.getStatus())) {
            throw new IllegalStateException("결제 대기 상태의 주문만 취소할 수 있습니다.");
        }

        orderDAO.updateStatus(orderId, "CANCELLED");

        notificationService.createNotification(
                order.getSellerId(), memberId, "ORDER", "ORDER",
                orderId, "주문이 취소되었습니다."
        );
    }
}
