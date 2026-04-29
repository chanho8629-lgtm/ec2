package com.app.bideo.service.work;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.domain.auction.AuctionVO;
import com.app.bideo.domain.interaction.CommentVO;
import com.app.bideo.domain.work.WorkFileVO;
import com.app.bideo.domain.work.WorkTagVO;
import com.app.bideo.dto.common.LikeToggleResponseDTO;
import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.dto.common.TagResponseDTO;
import com.app.bideo.dto.interaction.CommentResponseDTO;
import com.app.bideo.dto.work.WorkCreateRequestDTO;
import com.app.bideo.dto.work.WorkCreateResponseDTO;
import com.app.bideo.dto.work.WorkDTO;
import com.app.bideo.dto.work.WorkDetailResponseDTO;
import com.app.bideo.dto.work.WorkFileRequestDTO;
import com.app.bideo.dto.work.WorkListResponseDTO;
import com.app.bideo.dto.work.WorkSearchDTO;
import com.app.bideo.dto.work.WorkUpdateRequestDTO;
import com.app.bideo.repository.auction.AuctionDAO;
import com.app.bideo.repository.interaction.BookmarkDAO;
import com.app.bideo.service.interaction.CommentService;
import com.app.bideo.service.common.S3FileService;
import com.app.bideo.service.notification.NotificationService;
import com.app.bideo.repository.gallery.GalleryDAO;
import com.app.bideo.repository.work.WorkDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class WorkService {

    private final WorkDAO workDAO;
    private final AuctionDAO auctionDAO;
    private final GalleryDAO galleryDAO;
    private final BookmarkDAO bookmarkDAO;
    private final CommentService commentService;
    private final NotificationService notificationService;
    private final S3FileService s3FileService;

    // 작품 등록 후 파일/태그까지 함께 저장한다.
    public WorkCreateResponseDTO write(Long memberId, WorkCreateRequestDTO requestDTO, MultipartFile mediaFile, MultipartFile thumbnailFile) {
        Long resolvedMemberId = resolveMemberId(memberId);
        Long galleryId = requireGalleryId(requestDTO.getGalleryId());
        String category = resolveCategory(requestDTO.getCategory(), mediaFile);

        WorkDTO workDTO = WorkDTO.builder()
                .memberId(resolvedMemberId)
                .title(requestDTO.getTitle())
                .category(category)
                .description(requestDTO.getDescription())
                .price(requestDTO.getPrice())
                .licenseType(requestDTO.getLicenseType())
                .licenseTerms(requestDTO.getLicenseTerms())
                .isTradable(requestDTO.getIsTradable())
                .allowComment(requestDTO.getAllowComment())
                .showSimilar(requestDTO.getShowSimilar())
                .linkUrl(requestDTO.getLinkUrl())
                .status("ACTIVE")
                .build();

        workDAO.save(workDTO);
        saveThumbnailFile(workDTO.getId(), thumbnailFile);
        saveMediaFile(workDTO.getId(), mediaFile, thumbnailFile != null && !thumbnailFile.isEmpty() ? 1 : 0);
        saveTags(workDTO.getId(), requestDTO.getTagIds(), requestDTO.getTagNames());
        saveGalleryLink(galleryId, workDTO.getId());
        saveAuctionIfRequested(workDTO.getId(), resolvedMemberId, requestDTO.getPrice(), requestDTO.getAuctionEnabled(), requestDTO.getAuctionStartingPrice(), requestDTO.getAuctionDeadlineHours());

        return WorkCreateResponseDTO.builder()
                .id(workDTO.getId())
                .galleryId(galleryId)
                .redirectUrl("/profile?tab=works&galleryId=" + galleryId)
                .build();
    }

    // 검색 조건을 기준으로 작품 목록을 페이지 형태로 반환한다.
    @Transactional(readOnly = true)
    public PageResponseDTO<WorkListResponseDTO> getWorkList(WorkSearchDTO searchDTO) {
        int page = searchDTO.getPage() != null ? searchDTO.getPage() : 1;
        int size = searchDTO.getSize() != null ? searchDTO.getSize() : 10;
        searchDTO.setPage(page);
        searchDTO.setSize(size);

        List<WorkListResponseDTO> list = workDAO.findAll(searchDTO);
        applyThumbnailUrls(list);
        int total = workDAO.findTotal(searchDTO);
        int totalPages = (int) Math.ceil((double) total / size);

        return PageResponseDTO.<WorkListResponseDTO>builder()
                .content(list)
                .page(page)
                .size(size)
                .totalElements((long) total)
                .totalPages(totalPages)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TagResponseDTO> getTagSuggestions(String keyword) {
        String normalizedKeyword = normalizeTagKeyword(keyword);
        if (normalizedKeyword.isBlank()) {
            return Collections.emptyList();
        }

        return workDAO.findTagSuggestions(normalizedKeyword, 8);
    }

    // 작품 상세 화면에 필요한 정보를 한 번에 조회한다.
    @Transactional(readOnly = true)
    public WorkDetailResponseDTO getWorkDetail(Long id) {
        WorkDetailResponseDTO detail = workDAO.findDetailById(id)
                .orElseThrow(() -> new IllegalArgumentException("work not found"));
        applyFileUrls(detail);
        Long memberId = resolveAuthenticatedMemberId();
        detail.setIsLiked(memberId != null && workDAO.existsLike(memberId, id));
        detail.setIsBookmarked(memberId != null && bookmarkDAO.exists(memberId, "WORK", id));
        detail.setIsOwner(memberId != null && memberId.equals(detail.getMemberId()));
        detail.setHasActiveAuction(workDAO.existsActiveAuctionByWorkId(id));
        if (detail.getComments() != null) {
            detail.getComments().forEach(comment ->
                    {
                        comment.setIsLiked(memberId != null && commentService.isLikedByCurrentMember(comment.getId()));
                        comment.setIsOwner(memberId != null && memberId.equals(comment.getMemberId()));
                    }
            );
        }
        return detail;
    }

    public void increaseViewCount(Long id) {
        workDAO.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("work not found"));
        workDAO.increaseViewCount(id);
    }

    // 프로필 화면에 표시할 작성자 작품 목록 조회
    @Transactional(readOnly = true)
    public List<WorkListResponseDTO> getProfileWorks(Long galleryId) {
        Long memberId = resolveMemberId(null);
        return getProfileWorks(memberId, galleryId);
    }

    // 특정 회원의 프로필 화면에 표시할 작품 목록을 조회한다.
    @Transactional(readOnly = true)
    public List<WorkListResponseDTO> getProfileWorks(Long memberId, Long galleryId) { // 이승민| 프로필 닉네임 경로 적용으로 인한 추가
        WorkSearchDTO searchDTO = new WorkSearchDTO();
        searchDTO.setMemberId(memberId);
        searchDTO.setGalleryId(galleryId);
        searchDTO.setPage(1);
        searchDTO.setSize(50);
        List<WorkListResponseDTO> works = workDAO.findAll(searchDTO);
        applyThumbnailUrls(works);
        return works;
    }

    // 기존 파일/태그를 정리한 뒤 요청 데이터 기준으로 다시 구성한다.
    public WorkDetailResponseDTO update(Long id, Long memberId, WorkUpdateRequestDTO requestDTO) {
        return update(id, memberId, requestDTO, null, null);
    }

    // 수정 폼 요청 기준으로 작품과 연결 정보를 다시 구성한다.
    public WorkDetailResponseDTO update(Long id, Long memberId, WorkUpdateRequestDTO requestDTO, MultipartFile mediaFile) {
        return update(id, memberId, requestDTO, mediaFile, null);
    }

    public WorkDetailResponseDTO update(Long id, Long memberId, WorkUpdateRequestDTO requestDTO, MultipartFile mediaFile, MultipartFile thumbnailFile) {
        Long resolvedMemberId = resolveMemberId(memberId);
        validateWorkOwner(id, resolvedMemberId);
        Long galleryId = requireGalleryId(requestDTO.getGalleryId());
        Long previousGalleryId = galleryDAO.findGalleryIdByWorkId(id).orElse(null);

        WorkDTO workDTO = WorkDTO.builder()
                .id(id)
                .memberId(resolvedMemberId)
                .title(requestDTO.getTitle())
                .category(requestDTO.getCategory())
                .description(requestDTO.getDescription())
                .price(requestDTO.getPrice())
                .licenseType(requestDTO.getLicenseType())
                .licenseTerms(requestDTO.getLicenseTerms())
                .isTradable(requestDTO.getIsTradable())
                .allowComment(requestDTO.getAllowComment())
                .showSimilar(requestDTO.getShowSimilar())
                .linkUrl(requestDTO.getLinkUrl())
                .status("ACTIVE")
                .build();

        workDAO.setWork(workDTO);

        if ((mediaFile != null && !mediaFile.isEmpty()) || (thumbnailFile != null && !thumbnailFile.isEmpty())) {
            workDAO.deleteFilesByWorkId(id);
            saveThumbnailFile(id, thumbnailFile);
            if (mediaFile != null && !mediaFile.isEmpty()) {
                saveMediaFile(id, mediaFile, thumbnailFile != null && !thumbnailFile.isEmpty() ? 1 : 0);
            }
        } else if (requestDTO.getFiles() != null) {
            workDAO.deleteFilesByWorkId(id);
            saveFiles(id, requestDTO.getFiles());
        }

        if (requestDTO.getTagIds() != null || requestDTO.getTagNames() != null) {
            workDAO.deleteTagsByWorkId(id);
            saveTags(id, requestDTO.getTagIds(), requestDTO.getTagNames());
        }

        updateGalleryLink(previousGalleryId, galleryId, id);
        saveAuctionIfRequested(
                id,
                resolvedMemberId,
                requestDTO.getPrice(),
                requestDTO.getAuctionEnabled(),
                requestDTO.getAuctionStartingPrice(),
                requestDTO.getAuctionDeadlineHours()
        );

        return getWorkDetail(id);
    }

    // 작품 댓글 등록 후 최신 상세 정보를 다시 반환한다.
    public WorkDetailResponseDTO writeComment(Long workId, Long memberId, String content) {
        WorkDetailResponseDTO workDetail = getWorkDetail(workId);
        if (Boolean.FALSE.equals(workDetail.getAllowComment())) {
            throw new IllegalStateException("comment not allowed");
        }

        String normalizedContent = content == null ? "" : content.trim();
        if (normalizedContent.isBlank()) {
            throw new IllegalArgumentException("comment content is empty");
        }

        Long resolvedMemberId = resolveMemberId(memberId);
        workDAO.saveComment(
                CommentVO.builder()
                        .memberId(resolvedMemberId)
                        .targetType("WORK")
                        .targetId(workId)
                        .content(normalizedContent)
                        .isPinned(false)
                        .likeCount(0)
                        .build()
        );
        workDAO.increaseCommentCount(workId);

        notificationService.createNotification(
                workDetail.getMemberId(), resolvedMemberId, "COMMENT", "WORK", workId,
                normalizedContent.length() > 50
                        ? normalizedContent.substring(0, 50) + "..."
                        : normalizedContent
        );

        return getWorkDetail(workId);
    }

    public LikeToggleResponseDTO toggleLike(Long workId, Long memberId) {
        Long resolvedMemberId = resolveMemberId(memberId);
        WorkDetailResponseDTO workDetail = getWorkDetail(workId);

        boolean liked = workDAO.existsLike(resolvedMemberId, workId);
        if (liked) {
            workDAO.deleteLike(resolvedMemberId, workId);
            workDAO.decreaseLikeCount(workId);
        } else {
            workDAO.saveLike(resolvedMemberId, workId);
            workDAO.increaseLikeCount(workId);
            notificationService.createNotification(
                    workDetail.getMemberId(), resolvedMemberId, "LIKE", "WORK", workId,
                    "'" + workDetail.getTitle() + "' 작품에 좋아요를 눌렀습니다."
            );
        }

        return LikeToggleResponseDTO.builder()
                .targetId(workId)
                .targetType("WORK")
                .likeCount(workDAO.findLikeCount(workId))
                .liked(!liked)
                .build();
    }

    // 파일/태그 연결을 먼저 정리하고 작품을 soft delete 한다.
    public void delete(Long id) {
        Long resolvedMemberId = resolveMemberId(null);
        validateWorkOwner(id, resolvedMemberId);
        Long galleryId = galleryDAO.findGalleryIdByWorkId(id).orElse(null);
        workDAO.deleteFilesByWorkId(id);
        workDAO.deleteTagsByWorkId(id);
        if (galleryId != null) {
            galleryDAO.deleteWorkLinkByWorkId(id);
        }
        workDAO.delete(id);
        if (galleryId != null) {
            galleryDAO.updateWorkCount(galleryId);
        }
    }

    private void validateWorkOwner(Long workId, Long memberId) {
        WorkDTO work = workDAO.findById(workId)
                .orElseThrow(() -> new IllegalArgumentException("work not found"));
        if (!memberId.equals(work.getMemberId())) {
            throw new IllegalStateException("forbidden");
        }
    }

    // 요청 DTO의 파일 목록을 work_file 테이블 구조로 저장한다.
    private void saveFiles(Long workId, List<WorkFileRequestDTO> files) {
        List<WorkFileRequestDTO> safeFiles = files == null ? Collections.emptyList() : files;

        safeFiles.forEach(file -> workDAO.saveFile(
                WorkFileVO.builder()
                        .workId(workId)
                        .fileUrl(file.getFileUrl())
                        .fileType(file.getFileType())
                        .fileSize(file.getFileSize())
                        .width(file.getWidth())
                        .height(file.getHeight())
                        .sortOrder(file.getSortOrder() != null ? file.getSortOrder() : 0)
                        .build()
        ));
    }

    // 요청 받은 태그 id를 work_tag 연결 테이블에 저장한다.
    private void saveTags(Long workId, List<Long> tagIds, List<String> tagNames) {
        List<Long> resolvedTagIds = new ArrayList<>();
        if (tagIds != null) {
            resolvedTagIds.addAll(tagIds);
        }
        resolvedTagIds.addAll(resolveTagIds(tagNames));

        new LinkedHashSet<>(resolvedTagIds).forEach(tagId -> workDAO.saveTag(
                WorkTagVO.builder()
                        .workId(workId)
                        .tagId(tagId)
                        .build()
        ));
    }

    // 입력된 태그명은 기존 태그만 연결한다.
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

    private Long requireGalleryId(Long galleryId) {
        if (galleryId == null) {
            throw new IllegalArgumentException("예술관을 선택해주세요.");
        }
        return galleryId;
    }

    private Long requireExistingTagId(String tagName) {
        return workDAO.findTagIdByName(tagName)
                .orElseThrow(() -> new IllegalArgumentException("등록된 태그만 선택할 수 있습니다: " + tagName));
    }

    private String normalizeTagKeyword(String keyword) {
        if (keyword == null) {
            return "";
        }

        return keyword.trim().toLowerCase(Locale.ROOT);
    }

    private void saveAuctionIfRequested(Long workId, Long sellerId, Integer askingPrice, Boolean auctionEnabled, Integer startingPrice, Integer deadlineHours) {
        if (!Boolean.TRUE.equals(auctionEnabled)) {
            auctionDAO.updateStatusByWorkId(workId, "CLOSED");
            return;
        }
        if (workDAO.existsActiveAuctionByWorkId(workId)) {
            return;
        }
        if (startingPrice == null || startingPrice <= 0) {
            throw new IllegalArgumentException("입찰가를 입력해주세요.");
        }
        if (deadlineHours == null || deadlineHours <= 0) {
            throw new IllegalArgumentException("입찰 마감기한을 선택해주세요.");
        }
        int resolvedAskingPrice = askingPrice != null && askingPrice > 0 ? askingPrice : startingPrice;
        if (startingPrice > resolvedAskingPrice) {
            throw new IllegalArgumentException("입찰가는 작품 가격보다 클 수 없습니다.");
        }

        LocalDateTime startedAt = LocalDateTime.now();
        int feeAmount = (int) Math.round(resolvedAskingPrice * 0.10d);
        int settlementAmount = Math.max(0, resolvedAskingPrice - feeAmount);

        auctionDAO.save(
                AuctionVO.builder()
                        .workId(workId)
                        .sellerId(sellerId)
                        .askingPrice(resolvedAskingPrice)
                        .startingPrice(startingPrice)
                        .bidIncrement(10000)
                        .currentPrice(startingPrice)
                        .bidCount(0)
                        .feeRate(0.10d)
                        .feeAmount(feeAmount)
                        .settlementAmount(settlementAmount)
                        .deadlineHours(deadlineHours)
                        .startedAt(startedAt)
                        .closingAt(startedAt.plusHours(deadlineHours))
                        .cancelThreshold(0.70d)
                        .status("ACTIVE")
                        .build()
        );
    }

    private void saveGalleryLink(Long galleryId, Long workId) {
        if (galleryId == null) {
            return;
        }

        galleryDAO.saveWorkLink(galleryId, workId);
        galleryDAO.updateWorkCount(galleryId);
    }

    private void updateGalleryLink(Long previousGalleryId, Long galleryId, Long workId) {
        if (previousGalleryId != null) {
            galleryDAO.deleteWorkLinkByWorkId(workId);
            galleryDAO.updateWorkCount(previousGalleryId);
        }

        if (galleryId != null) {
            galleryDAO.saveWorkLink(galleryId, workId);
            galleryDAO.updateWorkCount(galleryId);
        }
    }

    // 인증이 아직 없어서 memberId가 없으면 첫 회원을 기본 작성자로 사용한다.
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

    // 업로드한 파일을 S3 경로로 저장한다.
    private void saveMediaFile(Long workId, MultipartFile mediaFile, int sortOrder) {
        if (mediaFile == null || mediaFile.isEmpty()) {
            return;
        }

        String contentType = mediaFile.getContentType() != null ? mediaFile.getContentType() : "application/octet-stream";
        String uploadedFileKey = s3FileService.upload("works", mediaFile);

        workDAO.saveFile(
                WorkFileVO.builder()
                        .workId(workId)
                        .fileUrl(uploadedFileKey)
                        .fileType(contentType)
                        .fileSize((int) mediaFile.getSize())
                        .sortOrder(sortOrder)
                        .build()
        );
    }

    private void saveThumbnailFile(Long workId, MultipartFile thumbnailFile) {
        if (thumbnailFile == null || thumbnailFile.isEmpty()) {
            return;
        }

        String contentType = thumbnailFile.getContentType() != null ? thumbnailFile.getContentType() : "application/octet-stream";
        if (!contentType.startsWith("image/")) {
            throw new IllegalArgumentException("thumbnail image only");
        }

        String uploadedFileKey = s3FileService.upload("works", thumbnailFile);
        workDAO.saveFile(
                WorkFileVO.builder()
                        .workId(workId)
                        .fileUrl(uploadedFileKey)
                        .fileType(contentType)
                        .fileSize((int) thumbnailFile.getSize())
                        .sortOrder(0)
                        .build()
        );
    }

    private String resolveCategory(String category, MultipartFile mediaFile) {
        if (mediaFile != null && !mediaFile.isEmpty() && mediaFile.getContentType() != null) {
            if (mediaFile.getContentType().startsWith("image/")) {
                return "IMAGE";
            }

            if (mediaFile.getContentType().startsWith("video/")) {
                return "VIDEO";
            }
        }

        return category != null ? category : "VIDEO";
    }

    private void applyFileUrls(WorkDetailResponseDTO detail) {
        if (detail == null) {
            return;
        }

        detail.setMemberProfileImage(s3FileService.getPresignedUrl(detail.getMemberProfileImage()));

        if (detail.getFiles() != null) {
            detail.getFiles().forEach(file -> file.setFileUrl(s3FileService.getPresignedUrl(file.getFileUrl())));
        }

        if (detail.getComments() != null) {
            detail.getComments().forEach(comment ->
                    comment.setMemberProfileImage(s3FileService.getPresignedUrl(comment.getMemberProfileImage()))
            );
        }
    }

    private void applyThumbnailUrls(List<WorkListResponseDTO> works) {
        if (works == null) {
            return;
        }

        works.forEach(work -> {
            work.setThumbnailUrl(s3FileService.getPresignedUrl(work.getThumbnailUrl()));
            work.setMemberProfileImage(s3FileService.getPresignedUrl(work.getMemberProfileImage()));
        });
    }
}
