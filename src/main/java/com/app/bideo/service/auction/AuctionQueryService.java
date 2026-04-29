package com.app.bideo.service.auction;

import com.app.bideo.dto.auction.AuctionDetailResponseDTO;
import com.app.bideo.repository.auction.AuctionDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuctionQueryService {

    private final AuctionDAO auctionDAO;

    public AuctionDetailResponseDTO getActiveAuctionByWorkId(Long workId) {
        return auctionDAO.findActiveByWorkId(workId)
                .orElseThrow(() -> new IllegalArgumentException("활성 경매를 찾을 수 없습니다."));
    }
}
