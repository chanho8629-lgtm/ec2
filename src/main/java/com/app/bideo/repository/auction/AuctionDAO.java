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

    public Optional<AuctionDetailResponseDTO> findDetailById(Long auctionId) {
        return Optional.ofNullable(auctionMapper.selectAuctionDetailById(auctionId));
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

    public Optional<AuctionVO> findLatestByWorkId(Long workId) {
        return Optional.ofNullable(auctionMapper.selectLatestByWorkId(workId));
    }

    public List<AuctionVO> findExpiredActiveAuctions() {
        return auctionMapper.selectExpiredActiveAuctions();
    }

    public void updateCurrentPrice(Long auctionId, Long currentPrice, Integer bidCount) {
        auctionMapper.updateCurrentPrice(auctionId, currentPrice, bidCount);
    }

    public int updateStatus(Long auctionId, String status) {
        return auctionMapper.updateStatus(auctionId, status);
    }

    public int updateStatusIfActive(Long auctionId, String status) {
        return auctionMapper.updateStatusIfActive(auctionId, status);
    }

    public void updateStatusByWorkId(Long workId, String status) {
        auctionMapper.updateStatusByWorkId(workId, status);
    }

    public int updateWinner(Long auctionId, Long winnerId, Long finalPrice) {
        return auctionMapper.updateWinner(auctionId, winnerId, finalPrice);
    }

    public int updateWinnerIfActive(Long auctionId, Long winnerId, Long finalPrice) {
        return auctionMapper.updateWinnerIfActive(auctionId, winnerId, finalPrice);
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
