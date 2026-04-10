package com.app.bideo.mapper.auction;

import com.app.bideo.domain.auction.BidVO;
import com.app.bideo.dto.auction.BidResponseDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BidMapper {
    void insertBid(BidVO vo);

    List<BidResponseDTO> selectByAuctionId(@Param("auctionId") Long auctionId,
                                            @Param("offset") int offset,
                                            @Param("limit") int limit);

    void updatePreviousWinning(@Param("auctionId") Long auctionId);

    BidResponseDTO selectHighestBid(@Param("auctionId") Long auctionId);

    List<Long> selectBidderIds(@Param("auctionId") Long auctionId);
}
