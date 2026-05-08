package com.app.bideo.service.contest;

import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.dto.contest.ContestCreateRequestDTO;
import com.app.bideo.dto.contest.ContestDetailResponseDTO;
import com.app.bideo.dto.contest.ContestEntryRequestDTO;
import com.app.bideo.dto.contest.ContestEntryResponseDTO;
import com.app.bideo.dto.contest.ContestListResponseDTO;
import com.app.bideo.dto.contest.ContestSearchDTO;
import com.app.bideo.dto.contest.ContestShareRequestDTO;
import com.app.bideo.dto.contest.ContestWorkOptionDTO;
import com.app.bideo.dto.contest.ContestUpdateRequestDTO;
import com.app.bideo.dto.contest.ContestWinnerNotificationDTO;
import com.app.bideo.dto.member.MemberListResponseDTO;
import com.app.bideo.mapper.contest.ContestMapper;
import com.app.bideo.repository.member.MemberRepository;
import com.app.bideo.service.common.S3FileService;
import com.app.bideo.service.common.ShareService;
import com.app.bideo.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class ContestService {

    private final ContestMapper contestMapper;
    private final NotificationService notificationService;
    private final S3FileService s3FileService;
    private final MemberRepository memberRepository;
    private final ShareService shareService;

    public Long createContest(Long memberId, ContestCreateRequestDTO contestCreateRequestDTO) {
        validateContestCreateRequest(contestCreateRequestDTO);
        contestMapper.insertContest(memberId, contestCreateRequestDTO);
        Long contestId = contestCreateRequestDTO.getId();
        saveTags(contestId, contestCreateRequestDTO.getTagIds(), contestCreateRequestDTO.getTagNames());
        return contestId;
    }

    public Long createContest(Long memberId, ContestCreateRequestDTO dto, MultipartFile coverFile) {
        if (coverFile != null && !coverFile.isEmpty()) {
            String coverUrl = saveCoverImage(coverFile);
            dto.setCoverImage(coverUrl);
        }
        return createContest(memberId, dto);
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<ContestListResponseDTO> getContestList(ContestSearchDTO searchDTO) {
        List<ContestListResponseDTO> list = contestMapper.selectContestList(searchDTO);
        list.forEach(c -> c.setCoverImage(s3FileService.getPresignedUrl(c.getCoverImage())));
        int total = contestMapper.selectContestCount(searchDTO);
        int size = searchDTO.getSize() != null ? searchDTO.getSize() : 10;
        int totalPages = (int) Math.ceil((double) total / size);

        return PageResponseDTO.<ContestListResponseDTO>builder()
                .content(list)
                .page(searchDTO.getPage())
                .size(size)
                .totalElements((long) total)
                .totalPages(totalPages)
                .build();
    }

    @Transactional(readOnly = true)
    public ContestDetailResponseDTO getContestDetail(Long id, Long memberId) {
        ContestDetailResponseDTO result = contestMapper.selectContestDetail(id, memberId);
        if (result == null) {
            throw new IllegalArgumentException("contest not found");
        }
        result.setCoverImage(s3FileService.getPresignedUrl(result.getCoverImage()));
        return result;
    }

    @Transactional(readOnly = true)
    public List<ContestEntryResponseDTO> getContestEntryList(Long contestId) {
        return contestMapper.selectContestEntryList(contestId);
    }

    public void submitEntry(Long memberId, ContestEntryRequestDTO requestDTO) {
        if (requestDTO.getContestId() == null || requestDTO.getWorkId() == null) {
            throw new IllegalArgumentException("contest and work are required");
        }
        if (!contestMapper.existsContest(requestDTO.getContestId())) {
            throw new IllegalArgumentException("contest not found");
        }
        ContestDetailResponseDTO contest = contestMapper.selectContestDetail(requestDTO.getContestId(), null);
        validateEntryPeriod(contest);
        Long ownerId = contestMapper.selectContestOwnerId(requestDTO.getContestId());
        if (ownerId != null && ownerId.equals(memberId)) {
            throw new IllegalArgumentException("자신의 공모전에는 참여할 수 없습니다");
        }
        if (!contestMapper.existsOwnedWork(memberId, requestDTO.getWorkId())) {
            throw new IllegalArgumentException("work does not belong to member");
        }
        if (contestMapper.existsContestEntry(requestDTO.getContestId(), requestDTO.getWorkId())) {
            throw new IllegalStateException("contest entry already exists");
        }

        contestMapper.insertContestEntry(memberId, requestDTO);
        contestMapper.increaseContestEntryCount(requestDTO.getContestId());

        if (ownerId != null) {
            notificationService.createNotification(
                    ownerId, memberId, "CONTEST_ENTRY", "CONTEST",
                    requestDTO.getContestId(), "공모전에 새로운 참가 작품이 등록되었습니다."
            );
        }
    }

    public void selectWinner(Long contestId, Long memberId, Long entryId) {
        ContestDetailResponseDTO contest = contestMapper.selectContestDetail(contestId, null);
        if (contest == null) {
            throw new IllegalArgumentException("contest not found");
        }
        if (contest.getMemberId() == null || !contest.getMemberId().equals(memberId)) {
            throw new IllegalArgumentException("contest not found or not owned by member");
        }
        if (contest.getWinnerNotifiedAt() != null) {
            throw new IllegalStateException("winner already announced");
        }
        if (contest.getEntryEnd() == null || !LocalDate.now().isAfter(contest.getEntryEnd())) {
            throw new IllegalStateException("winner selection not available yet");
        }
        if (!contestMapper.existsContestEntryById(contestId, entryId)) {
            throw new IllegalArgumentException("contest entry not found");
        }

        contestMapper.clearContestWinner(contestId);
        int updated = contestMapper.updateContestWinner(contestId, entryId, "우승");
        if (updated == 0) {
            throw new IllegalArgumentException("contest entry not found");
        }
    }

    @Scheduled(cron = "0 5 0 * * *", zone = "Asia/Seoul")
    public void dispatchWinnerNotifications() {
        List<ContestWinnerNotificationDTO> winners =
                contestMapper.selectPendingWinnerNotifications(LocalDate.now().toEpochDay());

        for (ContestWinnerNotificationDTO winner : winners) {
            notificationService.createNotification(
                    winner.getWinnerMemberId(),
                    winner.getContestOwnerId(),
                    "CONTEST_WIN",
                    "CONTEST",
                    winner.getContestId(),
                    "공모전 우승작으로 선정되었습니다."
            );
            contestMapper.markWinnerNotificationSent(winner.getContestId());
        }
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<ContestListResponseDTO> getHostedContestList(Long memberId) {
        List<ContestListResponseDTO> list = contestMapper.selectHostedContestList(memberId);
        list.forEach(c -> c.setCoverImage(s3FileService.getPresignedUrl(c.getCoverImage())));
        return PageResponseDTO.<ContestListResponseDTO>builder()
                .content(list)
                .page(1)
                .size(list.size())
                .totalElements((long) list.size())
                .totalPages(list.isEmpty() ? 0 : 1)
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<ContestListResponseDTO> getParticipatedContestList(Long memberId) {
        List<ContestListResponseDTO> list = contestMapper.selectParticipatedContestList(memberId);
        list.forEach(c -> c.setCoverImage(s3FileService.getPresignedUrl(c.getCoverImage())));
        return PageResponseDTO.<ContestListResponseDTO>builder()
                .content(list)
                .page(1)
                .size(list.size())
                .totalElements((long) list.size())
                .totalPages(list.isEmpty() ? 0 : 1)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ContestWorkOptionDTO> getEntryWorkOptions(Long memberId) {
        return contestMapper.selectEntryWorkOptions(memberId);
    }

    public void updateContest(Long contestId, Long memberId, ContestUpdateRequestDTO requestDTO) {
        validateContestUpdateRequest(requestDTO);
        int updated = contestMapper.updateContest(contestId, memberId, requestDTO);
        if (updated == 0) {
            throw new IllegalArgumentException("contest not found or not owned by member");
        }
        contestMapper.deleteContestTagsByContestId(contestId);
        saveTags(contestId, requestDTO.getTagIds(), requestDTO.getTagNames());
    }

    public void updateContest(Long contestId, Long memberId, ContestUpdateRequestDTO requestDTO, MultipartFile coverFile) {
        if (coverFile != null && !coverFile.isEmpty()) {
            String coverUrl = saveCoverImage(coverFile);
            requestDTO.setCoverImage(coverUrl);
        }
        updateContest(contestId, memberId, requestDTO);
    }

    private String saveCoverImage(MultipartFile coverFile) {
        return s3FileService.upload("contests", coverFile);
    }

    private void validateContestCreateRequest(ContestCreateRequestDTO requestDTO) {
        if (requestDTO == null) {
            throw new IllegalArgumentException("request is required");
        }
        validateRequiredFields(requestDTO.getTitle(), requestDTO.getOrganizer());
        validateDates(requestDTO.getEntryStart(), requestDTO.getEntryEnd(), requestDTO.getResultDate());
    }

    private void validateContestUpdateRequest(ContestUpdateRequestDTO requestDTO) {
        if (requestDTO == null) {
            throw new IllegalArgumentException("request is required");
        }
        validateRequiredFields(requestDTO.getTitle(), requestDTO.getOrganizer());
        validateDates(requestDTO.getEntryStart(), requestDTO.getEntryEnd(), requestDTO.getResultDate());
    }

    private void validateRequiredFields(String title, String organizer) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("title is required");
        }
        if (organizer == null || organizer.isBlank()) {
            throw new IllegalArgumentException("organizer is required");
        }
    }

    private void saveTags(Long contestId, List<Long> tagIds, List<String> tagNames) {
        if (tagNames != null && !tagNames.isEmpty()) {
            for (String name : tagNames) {
                String cleaned = name.startsWith("#") ? name.substring(1) : name;
                if (cleaned.isBlank()) continue;
                Long tagId = contestMapper.findOrCreateTag(cleaned);
                contestMapper.insertContestTag(contestId, tagId);
            }
            return;
        }
        if (tagIds != null && !tagIds.isEmpty()) {
            for (Long tagId : tagIds) {
                contestMapper.insertContestTag(contestId, tagId);
            }
        }
    }

    private void validateDates(java.time.LocalDate entryStart, java.time.LocalDate entryEnd, java.time.LocalDate resultDate) {
        if (entryStart == null || entryEnd == null) {
            throw new IllegalArgumentException("entry period is required");
        }
        if (entryStart.isAfter(entryEnd)) {
            throw new IllegalArgumentException("entry period is invalid");
        }
        if (resultDate != null && !resultDate.isAfter(entryEnd)) {
            throw new IllegalArgumentException("result date is invalid");
        }
    }

    private void validateEntryPeriod(ContestDetailResponseDTO contest) {
        if (contest == null || contest.getEntryStart() == null || contest.getEntryEnd() == null) {
            throw new IllegalArgumentException("contest not found");
        }
        LocalDate today = LocalDate.now();
        if (today.isBefore(contest.getEntryStart()) || today.isAfter(contest.getEntryEnd())) {
            throw new IllegalArgumentException("contest entry period is closed");
        }
    }

    // 공유 대상 검색
    @Transactional(readOnly = true)
    public List<MemberListResponseDTO> searchShareReceivers(Long currentMemberId, String keyword) {
        String safeKeyword = keyword == null ? "" : keyword.trim();
        List<MemberListResponseDTO> receivers = memberRepository.searchByKeyword(safeKeyword, currentMemberId, 20);
        receivers.forEach(receiver -> receiver.setProfileImage(
                s3FileService.getPresignedUrl(receiver.getProfileImage())
        ));
        return receivers;
    }

    // 콘테스트 공유
    public void shareContest(Long currentMemberId, Long contestId, ContestShareRequestDTO requestDTO) {
        if (contestId == null) {
            throw new IllegalArgumentException("공모전 정보가 필요합니다.");
        }
        ContestDetailResponseDTO contest = contestMapper.selectContestDetail(contestId, null);
        if (contest == null) {
            throw new IllegalArgumentException("공모전을 찾을 수 없습니다.");
        }

        List<Long> receiverIds = requestDTO == null || requestDTO.getReceiverIds() == null
                ? List.of()
                : requestDTO.getReceiverIds().stream().distinct().toList();

        String extraMessage = requestDTO != null && requestDTO.getMessage() != null
                ? requestDTO.getMessage().trim()
                : "";

        shareService.shareToMembers(
                currentMemberId,
                receiverIds,
                contest.getTitle() + " 공모전을 공유했습니다.",
                "/contest/list?id=" + contestId,
                requestDTO != null ? requestDTO.getShareUrl() : null,
                extraMessage
        );
    }
}
