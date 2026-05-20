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
import com.app.bideo.dto.gallery.GallerySimilarityDocumentDTO;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
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

    @Value("${fastapi.base-url}")
    private String fastApiBaseUrl;

    // 예술관 등록
    @CacheEvict(value = {"dashboard", "profile"}, allEntries = true)
    public GalleryCreateResponseDTO write(Long memberId, GalleryCreateRequestDTO requestDTO, MultipartFile coverFile) {
        Long resolvedMemberId = resolveMemberId(memberId);
        requestDTO.setMemberId(resolvedMemberId);
        requestDTO.setCoverImage(saveCoverImage(coverFile));
        requestDTO.setAllowComment(requestDTO.getAllowComment() != null ? requestDTO.getAllowComment() : true);
        requestDTO.setShowSimilar(requestDTO.getShowSimilar() != null ? requestDTO.getShowSimilar() : true);
        galleryDAO.save(requestDTO);
        saveWorkLinks(requestDTO.getId(), requestDTO.getWorkIds(), resolvedMemberId);
        saveTags(requestDTO.getId(), requestDTO.getTagIds(), requestDTO.getTagNames());
        galleryDAO.updateWorkCount(requestDTO.getId());

        return GalleryCreateResponseDTO.builder()
                .galleryId(requestDTO.getId())
                .memberId(resolvedMemberId)
                .memberNickname(memberRepository.findById(resolvedMemberId)
                        .map(member -> member.getNickname())
                        .orElseThrow(() -> new IllegalStateException("member not found")))
                .redirectUrl("/main?relatedGalleryId=" + requestDTO.getId())
                .build();
    }

    // 메인 피드용 예술관 목록 페이징 조회
    @Transactional(readOnly = true)
    public PageResponseDTO<GalleryListResponseDTO> getGalleryList(GallerySearchDTO searchDTO) {
        int page = searchDTO.getPage() != null ? searchDTO.getPage() : 1;
        int size = searchDTO.getSize() != null ? searchDTO.getSize() : 10;
        searchDTO.setPage(page);
        searchDTO.setSize(size);

        if (searchDTO.getRelatedGalleryId() != null && searchDTO.getKeyword() == null && searchDTO.getTag() == null) {
            return getRelatedGalleryList(searchDTO);
        }

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

    @Transactional(readOnly = true)
    public List<GalleryListResponseDTO> getSimilarGalleries(Long galleryId, int limit) {
        List<GallerySimilarityDocumentDTO> documents = galleryDAO.findSimilarityDocuments(galleryId, Math.max(limit + 40, 60));
        GallerySimilarityDocumentDTO target = documents.stream()
                .filter(d -> Objects.equals(d.getId(), galleryId))
                .findFirst()
                .orElse(null);

        if (target == null || documents.size() <= 1) {
            return List.of();
        }

        List<GallerySimilarityDocumentDTO> candidates = documents.stream()
                .filter(d -> !Objects.equals(d.getId(), galleryId))
                .toList();

        List<Long> ids = requestSimilarGalleryIds(target, candidates, limit);
        if (ids.isEmpty()) {
            return List.of();
        }

        List<GalleryListResponseDTO> result = galleryDAO.findAllByIds(ids);
        result.forEach(g -> g.setCoverImage(s3FileService.getPresignedUrl(g.getCoverImage())));
        return result;
    }

    private PageResponseDTO<GalleryListResponseDTO> getRelatedGalleryList(GallerySearchDTO searchDTO) {
        int page = searchDTO.getPage() != null ? searchDTO.getPage() : 1;
        int size = searchDTO.getSize() != null ? searchDTO.getSize() : 10;
        int required = Math.max(page * size, size);
        int candidateLimit = Math.max(required + 60, 120);

        List<GallerySimilarityDocumentDTO> documents = galleryDAO.findSimilarityDocuments(searchDTO.getRelatedGalleryId(), candidateLimit);
        GallerySimilarityDocumentDTO target = documents.stream()
                .filter(document -> Objects.equals(document.getId(), searchDTO.getRelatedGalleryId()))
                .findFirst()
                .orElse(null);

        if (target == null || documents.size() <= 1) {
            return getLatestGalleryFallback(page, size);
        }

        List<GallerySimilarityDocumentDTO> candidates = documents.stream()
                .filter(document -> !Objects.equals(document.getId(), target.getId()))
                .toList();
        List<Long> recommendedIds = requestSimilarGalleryIds(target, candidates, Math.min(candidateLimit, 100));
        if (recommendedIds.isEmpty()) {
            return getLatestGalleryFallback(page, size);
        }

        int fromIndex = Math.min((page - 1) * size, recommendedIds.size());
        int toIndex = Math.min(fromIndex + size, recommendedIds.size());
        List<Long> pageIds = recommendedIds.subList(fromIndex, toIndex);
        List<GalleryListResponseDTO> list = galleryDAO.findAllByIds(pageIds);
        list.forEach(g -> g.setCoverImage(s3FileService.getPresignedUrl(g.getCoverImage())));

        return PageResponseDTO.<GalleryListResponseDTO>builder()
                .content(list)
                .page(page)
                .size(size)
                .totalElements((long) recommendedIds.size())
                .totalPages((int) Math.ceil((double) recommendedIds.size() / size))
                .build();
    }

    private PageResponseDTO<GalleryListResponseDTO> getLatestGalleryFallback(int page, int size) {
        GallerySearchDTO fallback = new GallerySearchDTO();
        fallback.setPage(page);
        fallback.setSize(size);
        List<GalleryListResponseDTO> list = galleryDAO.findAll(fallback);
        list.forEach(g -> g.setCoverImage(s3FileService.getPresignedUrl(g.getCoverImage())));
        int total = galleryDAO.findTotal(fallback);

        return PageResponseDTO.<GalleryListResponseDTO>builder()
                .content(list)
                .page(page)
                .size(size)
                .totalElements((long) total)
                .totalPages((int) Math.ceil((double) total / size))
                .build();
    }

    private List<Long> requestSimilarGalleryIds(
            GallerySimilarityDocumentDTO target,
            List<GallerySimilarityDocumentDTO> candidates,
            int limit
    ) {
        try {
            SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
            requestFactory.setConnectTimeout(Duration.ofSeconds(3));
            requestFactory.setReadTimeout(Duration.ofSeconds(10));

            GallerySimilarityResponse response = RestClient.builder()
                    .baseUrl(fastApiBaseUrl)
                    .requestFactory(requestFactory)
                    .build()
                    .post()
                    .uri("/api/gallery/similarity")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .accept(org.springframework.http.MediaType.APPLICATION_JSON)
                    .body(new GallerySimilarityRequest(
                            toSimilarityItem(target),
                            candidates.stream().map(this::toSimilarityItem).toList(),
                            limit
                    ))
                    .retrieve()
                    .body(GallerySimilarityResponse.class);

            if (response == null || response.results() == null) {
                return List.of();
            }

            return response.results().stream()
                    .sorted(Comparator.comparing(GallerySimilarityResult::score).reversed())
                    .map(GallerySimilarityResult::id)
                    .filter(Objects::nonNull)
                    .toList();
        } catch (RuntimeException e) {
            return List.of();
        }
    }

    private GallerySimilarityItem toSimilarityItem(GallerySimilarityDocumentDTO document) {
        return new GallerySimilarityItem(
                document.getId(),
                document.getTitle(),
                document.getDescription(),
                document.getTags(),
                document.getWorks()
        );
    }

    private record GallerySimilarityRequest(
            GallerySimilarityItem target,
            List<GallerySimilarityItem> candidates,
            int limit
    ) {
    }

    private record GallerySimilarityItem(
            Long id,
            String title,
            String description,
            List<String> tags,
            List<String> works
    ) {
    }

    private record GallerySimilarityResponse(List<GallerySimilarityResult> results) {
    }

    private record GallerySimilarityResult(Long id, Double score) {
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
        // 갤러리는 큐레이션이므로 작성자 외 작품도 포함 — galleryId 필터만 사용
        WorkSearchDTO searchDTO = new WorkSearchDTO();
        searchDTO.setGalleryId(galleryId);
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
        saveWorkLinks(id, requestDTO.getWorkIds(), resolvedMemberId);
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

        String galleryCommentSnippet = normalizedContent.length() > 40
                ? normalizedContent.substring(0, 40) + "..."
                : normalizedContent;
        notificationService.createNotification(
                galleryOwnerId, resolvedMemberId, "COMMENT", "GALLERY", galleryId,
                "'" + galleryDetail.getTitle() + "' 예술관에 댓글을 남겼습니다: " + galleryCommentSnippet
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

    private void saveWorkLinks(Long galleryId, List<Long> workIds, Long ownerId) {
        if (workIds == null || workIds.isEmpty()) {
            return;
        }

        new LinkedHashSet<>(workIds).forEach(workId -> {
            validateWorkOwner(workId, ownerId);
            galleryDAO.saveWorkLink(galleryId, workId);
        });
    }

    private void validateWorkOwner(Long workId, Long memberId) {
        Long ownerId = workDAO.findById(workId)
                .map(work -> work.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("work not found"));
        if (!ownerId.equals(memberId)) {
            throw new IllegalStateException("본인 작품만 본인 예술관에 추가할 수 있습니다.");
        }
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
