package com.app.bideo.service.auction;

import com.app.bideo.dto.auction.AuctionDetailResponseDTO;
import com.app.bideo.dto.auction.AuctionListResponseDTO;
import com.app.bideo.dto.auction.AuctionSearchDTO;
import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.repository.auction.AuctionDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuctionQueryService {

    private final AuctionDAO auctionDAO;

    public AuctionDetailResponseDTO getActiveAuctionByWorkId(Long workId) {
        return auctionDAO.findActiveByWorkId(workId)
                .orElseThrow(() -> new IllegalArgumentException("활성 경매를 찾을 수 없습니다."));
    }

    public PageResponseDTO<AuctionListResponseDTO> getAuctionList(AuctionSearchDTO searchDTO) {
        if (searchDTO.getPage() == null) searchDTO.setPage(1);
        if (searchDTO.getSize() == null) searchDTO.setSize(20);

        List<AuctionListResponseDTO> content = auctionDAO.findAuctions(searchDTO);
        int total = auctionDAO.countAuctions(searchDTO);

        return PageResponseDTO.<AuctionListResponseDTO>builder()
                .content(content)
                .page(searchDTO.getPage())
                .size(searchDTO.getSize())
                .totalElements((long) total)
                .totalPages((int) Math.ceil((double) total / searchDTO.getSize()))
                .build();
    }

    public AuctionDetailResponseDTO getAuctionDetail(Long auctionId, Long memberId) {
        return auctionDAO.findById(auctionId, memberId)
                .orElseThrow(() -> new IllegalArgumentException("경매를 찾을 수 없습니다."));
    }
}
