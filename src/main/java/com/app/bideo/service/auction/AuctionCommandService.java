package com.app.bideo.service.auction;

import com.app.bideo.domain.auction.AuctionVO;
import com.app.bideo.dto.auction.AuctionCreateRequestDTO;
import com.app.bideo.dto.auction.AuctionDetailResponseDTO;
import com.app.bideo.dto.auction.BidResponseDTO;
import com.app.bideo.dto.work.WorkDTO;
import com.app.bideo.repository.auction.AuctionDAO;
import com.app.bideo.repository.auction.BidDAO;
import com.app.bideo.repository.work.WorkDAO;
import com.app.bideo.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class AuctionCommandService {

    private final AuctionDAO auctionDAO;
    private final BidDAO bidDAO;
    private final WorkDAO workDAO;
    private final NotificationService notificationService;
    private final AuctionQueryService auctionQueryService;

    public AuctionDetailResponseDTO createAuction(Long memberId, AuctionCreateRequestDTO requestDTO) {
        if (requestDTO.getWorkId() == null) {
            throw new IllegalArgumentException("작품 정보가 올바르지 않습니다.");
        }
        if (requestDTO.getStartingPrice() == null || requestDTO.getStartingPrice() <= 0) {
            throw new IllegalArgumentException("판매 희망가를 입력해주세요.");
        }
        if (requestDTO.getDeadlineHours() == null || requestDTO.getDeadlineHours() <= 0) {
            throw new IllegalArgumentException("입찰 마감기한을 선택해주세요.");
        }

        WorkDTO work = workDAO.findById(requestDTO.getWorkId())
                .orElseThrow(() -> new IllegalArgumentException("작품을 찾을 수 없습니다."));

        if (!memberId.equals(work.getMemberId())) {
            throw new IllegalStateException("본인 작품만 경매 등록할 수 있습니다.");
        }
        if (workDAO.existsActiveAuctionByWorkId(requestDTO.getWorkId())) {
            throw new IllegalStateException("이미 진행 중인 경매가 있습니다.");
        }

        long resolvedAskingPrice = requestDTO.getAskingPrice() != null && requestDTO.getAskingPrice() > 0
                ? requestDTO.getAskingPrice()
                : requestDTO.getStartingPrice();
        if (requestDTO.getStartingPrice() > resolvedAskingPrice) {
            throw new IllegalArgumentException("입찰가는 작품 가격보다 클 수 없습니다.");
        }

        LocalDateTime startedAt = LocalDateTime.now();
        long feeAmount = (int) Math.round(resolvedAskingPrice * 0.10d);
        long settlementAmount = Math.max(0, resolvedAskingPrice - feeAmount);

        auctionDAO.save(
                AuctionVO.builder()
                        .workId(requestDTO.getWorkId())
                        .sellerId(memberId)
                        .askingPrice(resolvedAskingPrice)
                        .startingPrice(requestDTO.getStartingPrice())
                        .estimateLow(requestDTO.getEstimateLow())
                        .estimateHigh(requestDTO.getEstimateHigh())
                        .bidIncrement(requestDTO.getBidIncrement() != null && requestDTO.getBidIncrement() > 0 ? requestDTO.getBidIncrement() : 10000)
                        .currentPrice(requestDTO.getStartingPrice())
                        .bidCount(0)
                        .feeRate(0.10d)
                        .feeAmount(feeAmount)
                        .settlementAmount(settlementAmount)
                        .deadlineHours(requestDTO.getDeadlineHours())
                        .startedAt(startedAt)
                        .closingAt(startedAt.plusHours(requestDTO.getDeadlineHours()))
                        .cancelThreshold(0.70d)
                        .status("ACTIVE")
                        .build()
        );

        return auctionQueryService.getActiveAuctionByWorkId(requestDTO.getWorkId());
    }
}
