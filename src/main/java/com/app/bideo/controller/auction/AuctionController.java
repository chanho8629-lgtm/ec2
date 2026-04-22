package com.app.bideo.controller.auction;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.domain.auction.AuctionVO;
import com.app.bideo.dto.auction.*;
import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.service.auction.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auction")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;
    private final BidQueryService bidQueryService;
    private final BidCommandService bidCommandService;
    private final SimpMessagingTemplate messagingTemplate;

    // 경매 조회
    @GetMapping("/{workId}")
    public ResponseEntity<?> getAuction(@PathVariable Long workId,
                                        @AuthenticationPrincipal CustomUserDetails userDetails) {
        AuctionDetailResponseDTO responseDTO = auctionService.getActiveAuctionByWorkId(workId);

        if (userDetails != null) {
            responseDTO.setLoginMemberId(userDetails.getId());
        }

        return ResponseEntity.ok(responseDTO);
    }

    // 경매 입찰 등록 및 변경 사항 전파
    @PostMapping("/{auctionId}/bid")
    public ResponseEntity<?> placeBid(
            @PathVariable Long auctionId,
            @RequestBody BidRequestDTO requestDTO,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        requestDTO.setAuctionId(auctionId);
        BidResponseDTO result = bidCommandService.placeBid(userDetails.getId(), requestDTO);

        AuctionVO auction = auctionService.getAuction(auctionId);
        BidBroadcastDTO broadcast = BidBroadcastDTO.builder()
                .auctionId(auctionId)
                .memberId(result.getMemberId())
                .memberNickname(result.getMemberNickname())
                .bidPrice(result.getBidPrice())
                .currentPrice(auction.getCurrentPrice())
                .bidCount(auction.getBidCount())
                .nextMinBid(Math.round(result.getBidPrice() * 1.1))
                .createdDatetime(result.getCreatedDatetime())
                .build();

        messagingTemplate.convertAndSend("/topic/auction." + auctionId, broadcast);

        return ResponseEntity.ok(result);
    }


}
