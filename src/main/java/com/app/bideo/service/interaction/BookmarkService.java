package com.app.bideo.service.interaction;

import com.app.bideo.domain.interaction.BookmarkVO;
import com.app.bideo.repository.auction.AuctionDAO;
import com.app.bideo.repository.gallery.GalleryDAO;
import com.app.bideo.repository.interaction.BookmarkDAO;
import com.app.bideo.service.common.S3FileService;
import com.app.bideo.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class BookmarkService {

    private final BookmarkDAO bookmarkDAO;
    private final AuctionDAO auctionDAO;
    private final GalleryDAO galleryDAO;
    private final S3FileService s3FileService;
    private final NotificationService notificationService;

    // 북마크를 토글하고 대시보드 캐시를 함께 비운다.
    @CacheEvict(value = {"dashboard"}, allEntries = true)
    public Map<String, Object> toggleBookmark(Long memberId, String targetType, Long targetId) {
        boolean exists = bookmarkDAO.exists(memberId, targetType, targetId);
        if (exists) {
            bookmarkDAO.delete(memberId, targetType, targetId);
        } else {
            bookmarkDAO.save(BookmarkVO.builder()
                    .memberId(memberId)
                    .targetType(targetType)
                    .targetId(targetId)
                    .build());

            Long ownerId = resolveOwnerId(targetType, targetId);
            if (ownerId != null) {
                String label = switch (targetType) {
                    case "WORK" -> "회원님의 작품을 북마크했습니다.";
                    case "GALLERY" -> "회원님의 갤러리를 북마크했습니다.";
                    default -> "콘텐츠를 북마크했습니다.";
                };
                notificationService.createNotification(
                        ownerId, memberId, "BOOKMARK", targetType, targetId, label
                );
            }
        }
        return Map.of("bookmarked", !exists);
    }

    // 특정 대상의 북마크 여부를 조회한다.
    @Transactional(readOnly = true)
    public boolean isBookmarked(Long memberId, String targetType, Long targetId) {
        return bookmarkDAO.exists(memberId, targetType, targetId);
    }

    // 내 북마크 목록을 최신순으로 반환한다.
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMySavedItems(Long memberId) {
        List<Map<String, Object>> result = new ArrayList<>();
        result.addAll(bookmarkDAO.findMyBookmarks(memberId));
        result.forEach(item -> {
            Object thumb = item.get("thumbnail");
            if (thumb instanceof String && !((String) thumb).isBlank()) {
                item.put("thumbnail", s3FileService.getPresignedUrl((String) thumb));
            }
        });
        result.sort((a, b) -> {
            var dtA = a.get("createdDatetime");
            var dtB = b.get("createdDatetime");
            if (dtA instanceof Comparable && dtB instanceof Comparable) {
                return ((Comparable) dtB).compareTo(dtA);
            }
            return 0;
        });
        return result;
    }

    // 알림 발송을 위한 북마크 대상 소유자를 조회한다.
    private Long resolveOwnerId(String targetType, Long targetId) {
        if ("GALLERY".equals(targetType)) {
            return galleryDAO.findMemberIdById(targetId).orElse(null);
        }
        return null;
    }
}
