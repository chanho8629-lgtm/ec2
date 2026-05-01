package com.app.bideo.service.gallery;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.domain.gallery.GalleryTagVO;
import com.app.bideo.domain.interaction.CommentVO;
import com.app.bideo.dto.common.LikeToggleResponseDTO;
import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.dto.gallery.GalleryCreateRequestDTO;
import com.app.bideo.dto.gallery.GalleryCreateResponseDTO;
import com.app.bideo.dto.gallery.GalleryDetailResponseDTO;
import com.app.bideo.dto.gallery.GalleryListResponseDTO;
import com.app.bideo.dto.gallery.GallerySearchDTO;
import com.app.bideo.dto.gallery.GalleryUpdateRequestDTO;
import com.app.bideo.dto.gallery.SearchGallerySuggestionDTO;
import com.app.bideo.dto.interaction.CommentResponseDTO;
import com.app.bideo.dto.work.WorkSearchDTO;
import com.app.bideo.repository.gallery.GalleryDAO;
import com.app.bideo.repository.interaction.BookmarkDAO;
import com.app.bideo.repository.member.MemberRepository;
import com.app.bideo.repository.work.WorkDAO;
import com.app.bideo.service.interaction.CommentService;
import com.app.bideo.service.common.S3FileService;
import com.app.bideo.service.member.FollowService;
import com.app.bideo.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class GalleryService {

    private final GalleryDAO galleryDAO;
    private final WorkDAO workDAO;
    private final BookmarkDAO bookmarkDAO;
    private final MemberRepository memberRepository;
    private final CommentService commentService;
    private final FollowService followService;
    private final NotificationService notificationService;
    private final S3FileService s3FileService;

    // 예술관 등록
    @CacheEvict(value = {"dashboard", "profile"}, allEntries = true)
    public GalleryCreateResponseDTO write(Long memberId, GalleryCreateRequestDTO requestDTO, MultipartFile coverFile) {
        Long resolvedMemberId = resolveMemberId(memberId);
        requestDTO.setMemberId(resolvedMemberId);
        requestDTO.setCoverImage(saveCoverImage(coverFile));
        requestDTO.setAllowComment(requestDTO.getAllowComment() != null ? requestDTO.getAllowComment() : true);
        requestDTO.setShowSimilar(requestDTO.getShowSimilar() != null ? requestDTO.getShowSimilar() : true);
        galleryDAO.save(requestDTO);
        saveWorkLinks(requestDTO.getId(), requestDTO.getWorkIds());
        saveTags(requestDTO.getId(), requestDTO.getTagIds(), requestDTO.getTagNames());
        galleryDAO.updateWorkCount(requestDTO.getId());

        return GalleryCreateResponseDTO.builder()
                .galleryId(requestDTO.getId())
                .memberId(resolvedMemberId)
                .memberNickname(memberRepository.findById(resolvedMemberId)
                        .map(member -> member.getNickname())
                        .orElseThrow(() -> new IllegalStateException("member not found")))
                .redirectUrl("/profile?galleryId=" + requestDTO.getId())
                .build();
    }

    // 메인 피드용 예술관 목록 페이징 조회
    @Transactional(readOnly = true)
    public PageResponseDTO<GalleryListResponseDTO> getGalleryList(GallerySearchDTO searchDTO) {
        int page = searchDTO.getPage() != null ? searchDTO.getPage() : 1;
        int size = searchDTO.getSize() != null ? searchDTO.getSize() : 10;
        searchDTO.setPage(page);
        searchDTO.setSize(size);

        List<GalleryListResponseDTO> list = galleryDAO.findAll(searchDTO);
        list.forEach(g -> g.setCoverImage(s3FileService.getPresignedUrl(g.getCoverImage())));
        int total = galleryDAO.findTotal(searchDTO);
        int totalPages = (int) Math.ceil((double) total / size);

        return PageResponseDTO.<GalleryListResponseDTO>builder()
                .content(list)
                .page(page)
                .size(size)
                .totalElements((long) total)
                .totalPages(totalPages)
                .build();
    }

    // 프로필 하이라이트용 예술관 목록 조회
    @Transactional(readOnly = true)
    public List<GalleryListResponseDTO> getProfileGalleries() {
        return getProfileGalleries(resolveMemberId(null));
    }

    // 특정 회원의 프로필 하이라이트용 예술관 목록 조회
    @Transactional(readOnly = true)
    public List<GalleryListResponseDTO> getProfileGalleries(Long memberId) { // 이승민| 프로필 닉네임 경로 적용으로 인한 추가
        List<GalleryListResponseDTO> galleries = galleryDAO.findAllByMemberId(memberId);
        Long currentMemberId = resolveAuthenticatedMemberId();
        galleries.forEach(gallery -> {
            gallery.setCoverImage(s3FileService.getPresignedUrl(gallery.getCoverImage()));
            gallery.setIsLiked(currentMemberId != null && galleryDAO.existsLike(currentMemberId, gallery.getId()));
        });
        return galleries;
    }

    // 예술관 상세 조회
    @Transactional(readOnly = true)
    public GalleryDetailResponseDTO getGalleryDetail(Long id) {
        GalleryDetailResponseDTO detail = galleryDAO.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("gallery not found"));
        detail.setCoverImage(s3FileService.getPresignedUrl(detail.getCoverImage()));
        detail.setMemberProfileImage(s3FileService.getPresignedUrl(detail.getMemberProfileImage()));
        detail.setTags(galleryDAO.findTagsByGalleryId(id));
        detail.setWorks(getGalleryWorks(id, detail.getMemberId()));

        Long memberId = resolveAuthenticatedMemberId();
        detail.setIsLiked(memberId != null && galleryDAO.existsLike(memberId, id));
        detail.setIsBookmarked(memberId != null && bookmarkDAO.exists(memberId, "GALLERY", id));
        detail.setIsFollowing(
                memberId != null
                        && detail.getMemberId() != null
                        && !memberId.equals(detail.getMemberId())
                        && followService.isFollowing(memberId, detail.getMemberId())
        );
        detail.setIsOwner(memberId != null && memberId.equals(detail.getMemberId()));
        return detail;
    }

    public void increaseViewCount(Long id) {
        galleryDAO.increaseViewCount(id);
    }

    @Transactional(readOnly = true)
    private List<com.app.bideo.dto.work.WorkListResponseDTO> getGalleryWorks(Long galleryId, Long memberId) {
        WorkSearchDTO searchDTO = new WorkSearchDTO();
        searchDTO.setGalleryId(galleryId);
        searchDTO.setMemberId(memberId);
        searchDTO.setPage(1);
        searchDTO.setSize(50);
        List<com.app.bideo.dto.work.WorkListResponseDTO> works = workDAO.findAll(searchDTO);
        works.forEach(work -> {
            work.setThumbnailUrl(s3FileService.getPresignedUrl(work.getThumbnailUrl()));
            work.setMemberProfileImage(s3FileService.getPresignedUrl(work.getMemberProfileImage()));
        });
        return works;
    }

    // 추천 예술관 (인기순)
    @Transactional(readOnly = true)
    public List<GalleryListResponseDTO> getRecommendedGalleries() {
        List<GalleryListResponseDTO> galleries = galleryDAO.findRecommended();
        galleries.forEach(g -> g.setCoverImage(s3FileService.getPresignedUrl(g.getCoverImage())));
        return galleries;
    }

    // 검색 추천 예술관
    @Transactional(readOnly = true)
    public List<SearchGallerySuggestionDTO> getSearchSuggestions() {
        List<SearchGallerySuggestionDTO> suggestions = galleryDAO.findRecommendedSearchGalleries();
        suggestions.forEach(s -> {
            if (Boolean.TRUE.equals(s.getHasCoverImage())) {
                galleryDAO.findSearchGalleryCover(s.getId()).ifPresent(cover ->
                    s.setCoverImageUrl(s3FileService.getPresignedUrl(cover.getCoverImage()))
                );
            }
        });
        return suggestions;
    }

    @CacheEvict(value = {"dashboard", "profile"}, allEntries = true)
    public void update(Long id, Long memberId, GalleryUpdateRequestDTO requestDTO, MultipartFile coverFile) {
        Long resolvedMemberId = resolveMemberId(memberId);
        validateGalleryOwner(id, resolvedMemberId);
        if (requestDTO.getTitle() == null || requestDTO.getTitle().trim().isBlank()) {
            throw new IllegalArgumentException("gallery title is required");
        }

        requestDTO.setTitle(requestDTO.getTitle().trim());
        requestDTO.setDescription(requestDTO.getDescription() == null ? "" : requestDTO.getDescription().trim());

        if (coverFile != null && !coverFile.isEmpty()) {
            requestDTO.setCoverImage(saveCoverImage(coverFile));
        }

        galleryDAO.update(id, requestDTO);
        galleryDAO.deleteWorkLinksByGalleryId(id);
        saveWorkLinks(id, requestDTO.getWorkIds());
        galleryDAO.updateWorkCount(id);
        galleryDAO.deleteTagsByGalleryId(id);
        saveTags(id, requestDTO.getTagIds(), requestDTO.getTagNames());
    }

    @CacheEvict(value = {"dashboard", "profile"}, allEntries = true)
    public void delete(Long id, Long memberId) {
        Long resolvedMemberId = resolveMemberId(memberId);
        validateGalleryOwner(id, resolvedMemberId);
        List<Long> workIds = galleryDAO.findWorkIdsByGalleryId(id);

        workIds.forEach(workId -> {
            workDAO.deleteFilesByWorkId(workId);
            workDAO.deleteTagsByWorkId(workId);
            galleryDAO.deleteWorkLinkByWorkId(workId);
            workDAO.delete(workId);
        });

        galleryDAO.deleteWorkLinksByGalleryId(id);
        galleryDAO.delete(id);
    }

    @Transactional(readOnly = true)
    public List<CommentResponseDTO> getComments(Long id) {
        galleryDAO.findMemberIdById(id)
                .orElseThrow(() -> new IllegalArgumentException("gallery not found"));
        List<CommentResponseDTO> comments = galleryDAO.findCommentsByGalleryId(id);
        Long memberId = resolveAuthenticatedMemberId();
        comments.forEach(comment -> {
            applyCommentProfileUrls(comment);
            applyCommentState(comment, memberId);
        });
        return comments;
    }

    private void applyCommentProfileUrls(CommentResponseDTO comment) {
        if (comment == null) {
            return;
        }
        comment.setMemberProfileImage(s3FileService.getPresignedUrl(comment.getMemberProfileImage()));
        if (comment.getReplies() != null) {
            comment.getReplies().forEach(this::applyCommentProfileUrls);
        }
    }

    private void applyCommentState(CommentResponseDTO comment, Long memberId) {
        if (comment == null) {
            return;
        }
        comment.setIsLiked(memberId != null && commentService.isLikedByCurrentMember(comment.getId()));
        comment.setIsOwner(memberId != null && memberId.equals(comment.getMemberId()));
        if (comment.getReplies() != null) {
            comment.getReplies().forEach(reply -> applyCommentState(reply, memberId));
        }
    }

    public List<CommentResponseDTO> writeComment(Long galleryId, Long memberId, String content) {
        Long resolvedMemberId = resolveMemberId(memberId);
        GalleryDetailResponseDTO galleryDetail = galleryDAO.findById(galleryId)
                .orElseThrow(() -> new IllegalArgumentException("gallery not found"));
        if (Boolean.FALSE.equals(galleryDetail.getAllowComment())) {
            throw new IllegalStateException("comment not allowed");
        }
        Long galleryOwnerId = galleryDetail.getMemberId();

        String normalizedContent = content == null ? "" : content.trim();
        if (normalizedContent.isBlank()) {
            throw new IllegalArgumentException("comment content is empty");
        }

        galleryDAO.saveComment(
                CommentVO.builder()
                        .memberId(resolvedMemberId)
                        .targetType("GALLERY")
                        .targetId(galleryId)
                        .content(normalizedContent)
                        .isPinned(false)
                        .likeCount(0)
                        .build()
        );
        galleryDAO.increaseCommentCount(galleryId);

        notificationService.createNotification(
                galleryOwnerId, resolvedMemberId, "COMMENT", "GALLERY", galleryId,
                normalizedContent.length() > 50
                        ? normalizedContent.substring(0, 50) + "..."
                        : normalizedContent
        );

        return getComments(galleryId);
    }

    public LikeToggleResponseDTO toggleLike(Long galleryId, Long memberId) {
        Long resolvedMemberId = resolveMemberId(memberId);
        GalleryDetailResponseDTO galleryDetail = galleryDAO.findById(galleryId)
                .orElseThrow(() -> new IllegalArgumentException("gallery not found"));
        Long galleryOwnerId = galleryDetail.getMemberId();

        boolean liked = galleryDAO.existsLike(resolvedMemberId, galleryId);
        if (liked) {
            galleryDAO.deleteLike(resolvedMemberId, galleryId);
            galleryDAO.decreaseLikeCount(galleryId);
        } else {
            galleryDAO.saveLike(resolvedMemberId, galleryId);
            galleryDAO.increaseLikeCount(galleryId);
            notificationService.createNotification(
                    galleryOwnerId, resolvedMemberId, "LIKE", "GALLERY", galleryId,
                    "'" + galleryDetail.getTitle() + "' 예술관에 좋아요를 눌렀습니다."
            );
        }

        return LikeToggleResponseDTO.builder()
                .targetId(galleryId)
                .targetType("GALLERY")
                .likeCount(galleryDAO.findLikeCount(galleryId))
                .liked(!liked)
                .build();
    }

    private void validateGalleryOwner(Long galleryId, Long memberId) {
        Long ownerId = galleryDAO.findMemberIdById(galleryId)
                .orElseThrow(() -> new IllegalArgumentException("gallery not found"));
        if (!ownerId.equals(memberId)) {
            throw new IllegalStateException("forbidden");
        }
    }

    private Long resolveMemberId(Long memberId) {
        if (memberId != null) {
            return memberId;
        }

        Long authenticatedMemberId = resolveAuthenticatedMemberId();
        if (authenticatedMemberId != null) {
            return authenticatedMemberId;
        }

        throw new IllegalStateException("login required");
    }

    private Long resolveAuthenticatedMemberId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getId();
        }
        return null;
    }

    private String saveCoverImage(MultipartFile coverFile) {
        if (coverFile == null || coverFile.isEmpty()) {
            throw new IllegalArgumentException("cover image is required");
        }

        if (coverFile.getContentType() == null || !coverFile.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("image file only");
        }

        return s3FileService.upload("galleries", coverFile);
    }

    private void saveWorkLinks(Long galleryId, List<Long> workIds) {
        if (workIds == null || workIds.isEmpty()) {
            return;
        }

        new LinkedHashSet<>(workIds).forEach(workId -> galleryDAO.saveWorkLink(galleryId, workId));
    }

    private void saveTags(Long galleryId, List<Long> tagIds, List<String> tagNames) {
        List<Long> resolvedTagIds = new ArrayList<>();
        if (tagIds != null) {
            resolvedTagIds.addAll(tagIds);
        }
        resolvedTagIds.addAll(resolveTagIds(tagNames));

        new LinkedHashSet<>(resolvedTagIds).forEach(tagId ->
                galleryDAO.saveTag(galleryId, tagId)
        );
    }

    private List<Long> resolveTagIds(List<String> tagNames) {
        List<String> safeTagNames = tagNames == null ? Collections.emptyList() : tagNames;

        return safeTagNames.stream()
                .map(this::normalizeTagName)
                .filter(Objects::nonNull)
                .distinct()
                .map(this::requireExistingTagId)
                .toList();
    }

    private String normalizeTagName(String tagName) {
        if (tagName == null) {
            return null;
        }

        String normalized = tagName.trim();
        if (normalized.startsWith("#")) {
            normalized = normalized.substring(1).trim();
        }

        return normalized.isBlank() ? null : normalized;
    }

    private Long requireExistingTagId(String tagName) {
        return galleryDAO.findTagIdByName(tagName)
                .orElseThrow(() -> new IllegalArgumentException("등록된 태그만 선택할 수 있습니다: " + tagName));
    }
}
