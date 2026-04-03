package com.app.bideo.mapper.interaction;

import com.app.bideo.domain.interaction.BookmarkVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface BookmarkMapper {
    boolean existsBookmark(@Param("memberId") Long memberId,
                           @Param("targetType") String targetType,
                           @Param("targetId") Long targetId);

    void insertBookmark(BookmarkVO vo);

    void deleteBookmark(@Param("memberId") Long memberId,
                        @Param("targetType") String targetType,
                        @Param("targetId") Long targetId);

    List<Map<String, Object>> selectMyBookmarks(@Param("memberId") Long memberId);
}
