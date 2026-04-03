package com.app.bideo.mapper.common;

import com.app.bideo.dto.common.SearchHistoryResponseDTO;
import com.app.bideo.dto.common.TrendingKeywordDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SearchHistoryMapper {

    List<SearchHistoryResponseDTO> selectRecentSearches(@Param("memberId") Long memberId);

    void insertSearchHistory(@Param("memberId") Long memberId, @Param("keyword") String keyword);

    int deleteSearchHistory(@Param("id") Long id, @Param("memberId") Long memberId);

    List<TrendingKeywordDTO> selectTrendingKeywords();
}
