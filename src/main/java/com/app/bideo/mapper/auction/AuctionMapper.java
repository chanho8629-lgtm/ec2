package com.app.bideo.mapper.auction;

import com.app.bideo.dto.auction.AuctionDetailResponseDTO;
import com.app.bideo.dto.auction.AuctionListResponseDTO;
import com.app.bideo.dto.auction.AuctionSearchDTO;
import com.app.bideo.domain.auction.AuctionVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface AuctionMapper {

    void insertAuction(AuctionVO auctionVO);

    AuctionDetailResponseDTO selectActiveAuctionByWorkId(@Param("workId") Long workId);

    List<AuctionListResponseDTO> selectAuctions(AuctionSearchDTO searchDTO);

    int countAuctions(AuctionSearchDTO searchDTO);

    AuctionDetailResponseDTO selectAuctionDetail(@Param("auctionId") Long auctionId,
                                                  @Param("memberId") Long memberId);

    AuctionVO selectById(@Param("auctionId") Long auctionId);

    void updateCurrentPrice(@Param("auctionId") Long auctionId,
                            @Param("currentPrice") Integer currentPrice,
                            @Param("bidCount") Integer bidCount);

    void updateStatus(@Param("auctionId") Long auctionId,
                      @Param("status") String status);

    void updateWinner(@Param("auctionId") Long auctionId,
                      @Param("winnerId") Long winnerId,
                      @Param("finalPrice") Integer finalPrice);

    boolean existsWishlist(@Param("memberId") Long memberId,
                           @Param("auctionId") Long auctionId);

    void insertWishlist(@Param("memberId") Long memberId,
                        @Param("auctionId") Long auctionId);

    void deleteWishlist(@Param("memberId") Long memberId,
                        @Param("auctionId") Long auctionId);

    List<Map<String, Object>> selectMyWishlist(@Param("memberId") Long memberId);
}
