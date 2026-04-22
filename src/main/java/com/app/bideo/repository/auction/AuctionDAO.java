package com.app.bideo.repository.auction;

import com.app.bideo.dto.auction.AuctionDetailResponseDTO;
import com.app.bideo.dto.auction.AuctionListResponseDTO;
import com.app.bideo.dto.auction.AuctionSearchDTO;
import com.app.bideo.domain.auction.AuctionVO;
import com.app.bideo.mapper.auction.AuctionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AuctionDAO {

    private final AuctionMapper auctionMapper;

    public void save(AuctionVO auctionVO) {
        auctionMapper.insertAuction(auctionVO);
    }

    public Optional<AuctionDetailResponseDTO> findActiveByWorkId(Long workId) {
        return Optional.ofNullable(auctionMapper.selectActiveAuctionByWorkId(workId));
    }

    public List<AuctionListResponseDTO> findAuctions(AuctionSearchDTO searchDTO) {
        return auctionMapper.selectAuctions(searchDTO);
    }

    public int countAuctions(AuctionSearchDTO searchDTO) {
        return auctionMapper.countAuctions(searchDTO);
    }

    public Optional<AuctionDetailResponseDTO> findById(Long auctionId, Long memberId) {
        return Optional.ofNullable(auctionMapper.selectAuctionDetail(auctionId, memberId));
    }

    public AuctionVO findRawById(Long auctionId) {
        return auctionMapper.selectById(auctionId);
    }

    public void updateCurrentPrice(Long auctionId, Long currentPrice, Integer bidCount) {
        auctionMapper.updateCurrentPrice(auctionId, currentPrice, bidCount);
    }

    public void updateStatus(Long auctionId, String status) {
        auctionMapper.updateStatus(auctionId, status);
    }

    public void updateStatusByWorkId(Long workId, String status) {
        auctionMapper.updateStatusByWorkId(workId, status);
    }

    public void updateWinner(Long auctionId, Long winnerId, Integer finalPrice) {
        auctionMapper.updateWinner(auctionId, winnerId, finalPrice);
    }

    public boolean existsWishlist(Long memberId, Long auctionId) {
        return auctionMapper.existsWishlist(memberId, auctionId);
    }

    public void saveWishlist(Long memberId, Long auctionId) {
        auctionMapper.insertWishlist(memberId, auctionId);
    }

    public void deleteWishlist(Long memberId, Long auctionId) {
        auctionMapper.deleteWishlist(memberId, auctionId);
    }

    public List<Map<String, Object>> findMyWishlist(Long memberId) {
        return auctionMapper.selectMyWishlist(memberId);
    }
}
