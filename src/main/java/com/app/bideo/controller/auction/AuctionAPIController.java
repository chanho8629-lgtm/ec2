package com.app.bideo.controller.auction;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.dto.auction.*;
import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.service.auction.AuctionCommandService;
import com.app.bideo.service.auction.AuctionQueryService;
import com.app.bideo.service.auction.BidCommandService;
import com.app.bideo.service.auction.BidQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionAPIController {

    private final AuctionQueryService auctionQueryService;
    private final AuctionCommandService auctionCommandService;
    private final BidQueryService bidQueryService;
    private final BidCommandService bidCommandService;

    @GetMapping("/by-work/{workId}")
    public AuctionDetailResponseDTO detailByWorkId(@PathVariable Long workId) {
        return auctionQueryService.getActiveAuctionByWorkId(workId);
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<AuctionListResponseDTO>> getAuctionList(AuctionSearchDTO searchDTO) {
        return ResponseEntity.ok(auctionQueryService.getAuctionList(searchDTO));
    }

    @PostMapping
    public ResponseEntity<AuctionDetailResponseDTO> createAuction(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody AuctionCreateRequestDTO requestDTO) {
        return ResponseEntity.ok(auctionCommandService.createAuction(userDetails.getId(), requestDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuctionDetailResponseDTO> getAuctionDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long memberId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(auctionQueryService.getAuctionDetail(id, memberId));
    }

    @PostMapping("/{id}/wishlist")
    public ResponseEntity<Map<String, Object>> toggleWishlist(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(auctionCommandService.toggleWishlist(userDetails.getId(), id));
    }

    @PostMapping("/{id}/bids")
    public ResponseEntity<BidResponseDTO> placeBid(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody BidRequestDTO requestDTO) {
        requestDTO.setAuctionId(id);
        return ResponseEntity.ok(bidCommandService.placeBid(userDetails.getId(), requestDTO));
    }

    @GetMapping("/{id}/bids")
    public ResponseEntity<List<BidResponseDTO>> getBids(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(bidQueryService.getBidsByAuction(id, page));
    }

    @GetMapping("/my-bids")
    public ResponseEntity<List<MyBidHistoryResponseDTO>> getMyClosedBids(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(bidQueryService.getClosedBidHistories(userDetails.getId()));
    }
}
