package com.app.bideo.service.common;

import com.app.bideo.dto.common.SearchHistoryResponseDTO;
import com.app.bideo.dto.common.TrendingKeywordDTO;
import com.app.bideo.repository.common.SearchHistoryDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class SearchHistoryService {

    private final SearchHistoryDAO searchHistoryDAO;

    @Transactional(readOnly = true)
    public List<SearchHistoryResponseDTO> getRecentSearches(Long memberId) {
        return searchHistoryDAO.findRecentSearches(memberId);
    }

    @CacheEvict(value = "trendingKeywords", allEntries = true)
    public void saveSearch(Long memberId, String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return;
        searchHistoryDAO.save(memberId, keyword.trim());
    }

    public void deleteSearch(Long id, Long memberId) {
        searchHistoryDAO.delete(id, memberId);
    }

    @Cacheable("trendingKeywords")
    @Transactional(readOnly = true)
    public List<TrendingKeywordDTO> getTrendingKeywords() {
        return searchHistoryDAO.findTrendingKeywords();
    }
}
