package com.app.bideo.service.auction;

import com.app.bideo.domain.auction.AuctionVO;
import com.app.bideo.domain.auction.BidVO;
import com.app.bideo.dto.auction.BidRequestDTO;
import com.app.bideo.dto.auction.BidResponseDTO;
import com.app.bideo.repository.auction.AuctionDAO;
import com.app.bideo.repository.auction.BidDAO;
import com.app.bideo.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class BidCommandService {

    private final BidDAO bidDAO;
    private final AuctionDAO auctionDAO;
    private final NotificationService notificationService;

    public BidResponseDTO placeBid(Long memberId, BidRequestDTO requestDTO) {
        AuctionVO auction = auctionDAO.findRawById(requestDTO.getAuctionId());
        if (auction == null) {
            throw new IllegalArgumentException("경매를 찾을 수 없습니다.");
        }
        if (!"ACTIVE".equals(auction.getStatus())) {
            throw new IllegalStateException("종료된 경매입니다.");
        }
        if (auction.getClosingAt() != null && auction.getClosingAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("경매가 종료되었습니다.");
        }
        if (auction.getSellerId().equals(memberId)) {
            throw new IllegalArgumentException("자신의 경매에는 입찰할 수 없습니다.");
        }
        if (requestDTO.getBidPrice() <= auction.getCurrentPrice()) {
            throw new IllegalArgumentException("현재가보다 높은 금액으로 입찰해야 합니다.");
        }
        if (requestDTO.getBidPrice() < Math.round(auction.getCurrentPrice() * 1.1)) {
            throw new IllegalArgumentException("최소 입찰 단위 이상으로 입찰해야 합니다.");
        }

        BidResponseDTO previousHighest = bidDAO.findHighestBid(requestDTO.getAuctionId()).orElse(null);

        bidDAO.clearPreviousWinning(requestDTO.getAuctionId());
        bidDAO.save(BidVO.builder()
                .auctionId(requestDTO.getAuctionId())
                .memberId(memberId)
                .bidPrice(requestDTO.getBidPrice())
                .isWinning(true)
                .build());

        int uniqueBidderCount = bidDAO.findBidderIds(requestDTO.getAuctionId()).size();

        auctionDAO.updateCurrentPrice(
                requestDTO.getAuctionId(),
                requestDTO.getBidPrice(),
                uniqueBidderCount
        );

        notificationService.createNotification(
                auction.getSellerId(), memberId, "BID", "AUCTION",
                auction.getWorkId(),
                String.format("%,d원에 입찰했습니다.", requestDTO.getBidPrice())
        );

        if (previousHighest != null && !previousHighest.getMemberId().equals(memberId)) {
            notificationService.createNotification(
                    previousHighest.getMemberId(), memberId, "BID", "AUCTION",
                    auction.getWorkId(),
                    String.format("더 높은 금액(%,d원)으로 입찰했습니다.", requestDTO.getBidPrice())
            );
        }

        return bidDAO.findHighestBid(requestDTO.getAuctionId()).orElse(null);
    }
}
