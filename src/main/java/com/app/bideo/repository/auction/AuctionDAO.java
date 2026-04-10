package com.app.bideo.repository.auction;

import com.app.bideo.dto.auction.AuctionDetailResponseDTO;
import com.app.bideo.domain.auction.AuctionVO;
import com.app.bideo.mapper.auction.AuctionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AuctionDAO {

    private final AuctionMapper auctionMapper;

    // 경매 등록
    public void save(AuctionVO auctionVO) {
        auctionMapper.insert(auctionVO);
    }

    // 작품 id로 조회
    public Optional<AuctionDetailResponseDTO> findActiveByWorkId(Long workId) {
        return Optional.ofNullable(auctionMapper.selectActiveAuctionByWorkId(workId));
    }

    // 경매 id로 조회
    public AuctionVO findRawById(Long auctionId) {
        return auctionMapper.selectById(auctionId);
    }

    // 최고가 반영
    public void updateCurrentPrice(Long auctionId, Integer currentPrice, Integer bidCount) {
        auctionMapper.updateCurrentPrice(auctionId, currentPrice, bidCount);
    }

    // 경매 상태 변경
    public void updateStatus(Long auctionId, String status) {
        auctionMapper.updateStatus(auctionId, status);
    }

    // 낙찰자 등록
    public void updateWinner(Long auctionId, Long winnerId, Integer finalPrice) {
        auctionMapper.updateWinner(auctionId, winnerId, finalPrice);
    }
}
