package com.app.bideo.service.auction;

import com.app.bideo.dto.auction.BidResponseDTO;
import com.app.bideo.dto.auction.MyBidHistoryResponseDTO;
import com.app.bideo.repository.auction.BidDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BidQueryService {

    private static final int PAGE_SIZE = 20;

    private final BidDAO bidDAO;

    public List<BidResponseDTO> getBidsByAuction(Long auctionId, int page) {
        return bidDAO.findByAuctionId(auctionId, page * PAGE_SIZE, PAGE_SIZE);
    }

    public List<MyBidHistoryResponseDTO> getClosedBidHistories(Long memberId) {
        return bidDAO.findClosedBidHistoriesByMemberId(memberId);
    }
}
