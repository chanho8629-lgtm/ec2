package com.app.bideo.mapper.auction;

import com.app.bideo.dto.auction.AuctionDetailResponseDTO;
import com.app.bideo.domain.auction.AuctionVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AuctionMapper {

    // 경매 등록
    void insert(AuctionVO auctionVO);

    // 작품 id로 조회
    AuctionDetailResponseDTO selectActiveAuctionByWorkId(@Param("workId") Long workId);

    // 경매 id로 조회
    AuctionVO selectById(@Param("auctionId") Long auctionId);

    // 최고가 갱신
    void updateCurrentPrice(@Param("auctionId") Long auctionId,
                            @Param("currentPrice") Integer currentPrice,
                            @Param("bidCount") Integer bidCount);

    // 경매 상태 변경
    void updateStatus(@Param("auctionId") Long auctionId,
                      @Param("status") String status);

    // 낙찰자 등록
    void updateWinner(@Param("auctionId") Long auctionId,
                      @Param("winnerId") Long winnerId,
                      @Param("finalPrice") Integer finalPrice);
}
