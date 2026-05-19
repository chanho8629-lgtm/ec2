package com.app.bideo.service.auction;

import com.app.bideo.dto.auction.AuctionDetailResponseDTO;
import com.app.bideo.dto.auction.AuctionRagAnalyzeResponseDTO;
import com.app.bideo.dto.common.TagResponseDTO;
import com.app.bideo.dto.work.WorkDTO;
import com.app.bideo.dto.work.WorkFileResponseDTO;
import com.app.bideo.repository.work.WorkDAO;
import com.app.bideo.service.common.S3FileService;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuctionRagService {

    private final AuctionService auctionService;
    private final WorkDAO workDAO;
    private final S3FileService s3FileService;

    @Value("${fastapi.base-url:}")
    private String fastApiBaseUrl;

    public AuctionRagAnalyzeResponseDTO analyzeAuction(Long auctionId) {
        AuctionDetailResponseDTO auction = auctionService.getAuctionDetailById(auctionId);
        WorkDTO work = workDAO.findById(auction.getWorkId())
                .orElseThrow(() -> new IllegalArgumentException("경매 작품을 찾을 수 없습니다."));
        List<TagResponseDTO> tags = workDAO.findTagsByWorkId(auction.getWorkId());
        List<WorkFileResponseDTO> files = workDAO.findFilesByWorkId(auction.getWorkId());

        FastApiAuctionRagRequest request = new FastApiAuctionRagRequest(
                valueOrEmpty(work.getTitle()),
                valueOrEmpty(work.getDescription()),
                valueOrEmpty(work.getCategory()),
                resolveTagNames(tags),
                longValue(auction.getStartingPrice()),
                longValue(auction.getCurrentPrice()),
                longValue(auction.getBidCount()),
                countBidders(auction),
                intValue(work.getViewCount()),
                intValue(work.getLikeCount()),
                null,
                resolveImageUrl(files, auction),
                true
        );

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(10));
        requestFactory.setReadTimeout(Duration.ofMinutes(5));

        AuctionRagAnalyzeResponseDTO response = RestClient.builder()
                .baseUrl(fastApiBaseUrl)
                .requestFactory(requestFactory)
                .build()
                .post()
                .uri("/api/auction/rag/analyze")
                .body(request)
                .retrieve()
                .body(AuctionRagAnalyzeResponseDTO.class);

        if (response == null) {
            throw new IllegalStateException("FastAPI 경매 RAG 응답이 비어 있습니다.");
        }
        return response;
    }

    private List<String> resolveTagNames(List<TagResponseDTO> tags) {
        if (tags == null || tags.isEmpty()) {
            return List.of();
        }
        return tags.stream()
                .map(TagResponseDTO::getTagName)
                .filter(tagName -> tagName != null && !tagName.isBlank())
                .toList();
    }

    private String resolveImageUrl(List<WorkFileResponseDTO> files, AuctionDetailResponseDTO auction) {
        String imageKey = resolveImageKey(files, auction);
        if (imageKey == null || imageKey.isBlank()) {
            return null;
        }
        try {
            return s3FileService.getPresignedUrl(imageKey);
        } catch (RuntimeException e) {
            return imageKey;
        }
    }

    private String resolveImageKey(List<WorkFileResponseDTO> files, AuctionDetailResponseDTO auction) {
        if (files != null && !files.isEmpty()) {
            return files.stream()
                    .filter(file -> file != null && file.getFileUrl() != null && !file.getFileUrl().isBlank())
                    .findFirst()
                    .map(WorkFileResponseDTO::getFileUrl)
                    .orElse(auction.getWorkThumbnail());
        }
        return auction.getWorkThumbnail();
    }

    private long countBidders(AuctionDetailResponseDTO auction) {
        if (auction.getBids() == null || auction.getBids().isEmpty()) {
            return 0L;
        }
        return auction.getBids().stream()
                .filter(bid -> bid != null && bid.getMemberId() != null)
                .map(bid -> bid.getMemberId())
                .distinct()
                .count();
    }

    private String valueOrEmpty(String value) {
        return value == null ? "" : value;
    }

    private long longValue(Long value) {
        return value == null ? 0L : value;
    }

    private int intValue(Integer value) {
        return value == null ? 0 : value;
    }

    private record FastApiAuctionRagRequest(
            String title,
            String description,
            String category,
            List<String> tags,
            @JsonProperty("start_price") long startPrice,
            @JsonProperty("current_price") long currentPrice,
            @JsonProperty("bid_count") long bidCount,
            @JsonProperty("bidder_count") long bidderCount,
            @JsonProperty("view_count") int viewCount,
            @JsonProperty("like_count") int likeCount,
            @JsonProperty("image_base64") String imageBase64,
            @JsonProperty("image_url") String imageUrl,
            @JsonProperty("fast_mode") boolean fastMode
    ) {
    }
}
