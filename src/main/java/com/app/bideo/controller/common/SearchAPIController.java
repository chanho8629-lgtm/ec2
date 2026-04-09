package com.app.bideo.controller.common;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.dto.common.SearchHistoryResponseDTO;
import com.app.bideo.dto.common.TrendingKeywordDTO;
import com.app.bideo.dto.gallery.SearchGallerySuggestionDTO;
import com.app.bideo.dto.search.SearchResultResponseDTO;
import com.app.bideo.service.common.SearchHistoryService;
import com.app.bideo.service.gallery.GalleryService;
import com.app.bideo.service.search.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchAPIController {

    private final SearchHistoryService searchHistoryService;
    private final GalleryService galleryService;
    private final SearchService searchService;

    @GetMapping("/recent")
    public List<SearchHistoryResponseDTO> recentSearches(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return Collections.emptyList();
        return searchHistoryService.getRecentSearches(userDetails.getId());
    }

    @PostMapping("/recent")
    public ResponseEntity<Void> saveSearch(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.ok().build();
        searchHistoryService.saveSearch(userDetails.getId(), body.get("keyword"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/recent/{id}")
    public ResponseEntity<Void> deleteSearch(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.ok().build();
        searchHistoryService.deleteSearch(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/trending")
    public List<TrendingKeywordDTO> trendingKeywords() {
        return searchHistoryService.getTrendingKeywords();
    }

    @GetMapping("/suggestions")
    public List<SearchGallerySuggestionDTO> gallerySuggestions() {
        return galleryService.getSearchSuggestions();
    }

    @GetMapping("/{page}")
    public SearchResultResponseDTO search(
            @PathVariable int page,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(defaultValue = "latest") String sort,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long currentMemberId = userDetails != null ? userDetails.getId() : 0L;
        return searchService.search(page, keyword, type, sort, currentMemberId);
    }
}
