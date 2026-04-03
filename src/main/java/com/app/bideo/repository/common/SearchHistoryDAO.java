package com.app.bideo.repository.common;

import com.app.bideo.dto.common.SearchHistoryResponseDTO;
import com.app.bideo.dto.common.TrendingKeywordDTO;
import com.app.bideo.mapper.common.SearchHistoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class SearchHistoryDAO {

    private final SearchHistoryMapper searchHistoryMapper;

    public List<SearchHistoryResponseDTO> findRecentSearches(Long memberId) {
        return searchHistoryMapper.selectRecentSearches(memberId);
    }

    public void save(Long memberId, String keyword) {
        searchHistoryMapper.insertSearchHistory(memberId, keyword);
    }

    public void delete(Long id, Long memberId) {
        searchHistoryMapper.deleteSearchHistory(id, memberId);
    }

    public List<TrendingKeywordDTO> findTrendingKeywords() {
        return searchHistoryMapper.selectTrendingKeywords();
    }
}
