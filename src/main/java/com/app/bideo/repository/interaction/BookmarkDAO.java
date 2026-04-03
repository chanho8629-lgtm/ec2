package com.app.bideo.repository.interaction;

import com.app.bideo.domain.interaction.BookmarkVO;
import com.app.bideo.mapper.interaction.BookmarkMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class BookmarkDAO {

    private final BookmarkMapper bookmarkMapper;

    public boolean exists(Long memberId, String targetType, Long targetId) {
        return bookmarkMapper.existsBookmark(memberId, targetType, targetId);
    }

    public void save(BookmarkVO vo) {
        bookmarkMapper.insertBookmark(vo);
    }

    public void delete(Long memberId, String targetType, Long targetId) {
        bookmarkMapper.deleteBookmark(memberId, targetType, targetId);
    }

    public List<Map<String, Object>> findMyBookmarks(Long memberId) {
        return bookmarkMapper.selectMyBookmarks(memberId);
    }
}
