package com.app.bideo.repository.auction;

import com.app.bideo.domain.auction.BidVO;
import com.app.bideo.dto.auction.BidResponseDTO;
import com.app.bideo.dto.auction.MyBidHistoryResponseDTO;
import com.app.bideo.mapper.auction.BidMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class BidDAO {

    private final BidMapper bidMapper;

    public void save(BidVO vo) {
        bidMapper.insertBid(vo);
    }

    public List<BidResponseDTO> findByAuctionId(Long auctionId, int offset, int limit) {
        return bidMapper.selectByAuctionId(auctionId, offset, limit);
    }

    public void clearPreviousWinning(Long auctionId) {
        bidMapper.updatePreviousWinning(auctionId);
    }

    public Optional<BidResponseDTO> findHighestBid(Long auctionId) {
        return Optional.ofNullable(bidMapper.selectHighestBid(auctionId));
    }

    public List<Long> findBidderIds(Long auctionId) {
        return bidMapper.selectBidderIds(auctionId);
    }

    public List<MyBidHistoryResponseDTO> findClosedBidHistoriesByMemberId(Long memberId) {
        return bidMapper.selectClosedBidHistoriesByMemberId(memberId);
    }
}
