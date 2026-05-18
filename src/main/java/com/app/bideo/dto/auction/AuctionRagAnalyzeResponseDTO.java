package com.app.bideo.dto.auction;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AuctionRagAnalyzeResponseDTO(
        @JsonProperty("image_analysis") String imageAnalysis,
        @JsonProperty("auction_report") String auctionReport,
        @JsonProperty("used_rag") Boolean usedRag,
        @JsonProperty("indexed_document_hint") String indexedDocumentHint
) {
}
