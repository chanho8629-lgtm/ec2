package com.app.bideo.service.profile;

import com.app.bideo.domain.member.MemberVO;
import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.dto.member.BlockResponseDTO;
import com.app.bideo.dto.member.MyProfileBadgeManageResponseDTO;
import com.app.bideo.dto.member.MemberBadgeResponseDTO;
import com.app.bideo.dto.member.MemberListResponseDTO;
import com.app.bideo.dto.member.MemberUpdateRequestDTO;
import com.app.bideo.dto.member.NicknameUpdateRequestDTO;
import com.app.bideo.dto.member.PasswordChangeRequestDTO;
import com.app.bideo.dto.member.ProfileBasicUpdateRequestDTO;
import com.app.bideo.dto.member.ProfileShareRequestDTO;
import com.app.bideo.dto.member.ProfileViewResponseDTO;
import com.app.bideo.repository.member.MemberRepository;
import com.app.bideo.service.common.S3FileService;
import com.app.bideo.service.common.ShareService;
import com.app.bideo.service.member.BlockService;
import com.app.bideo.service.member.FollowService;
import com.app.bideo.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private static final int PAGE_SIZE = 20;
    private static final int MAX_DISPLAY_BADGES = 2;

    private final MemberRepository memberRepository;
    private final FollowService followService;
    private final BlockService blockService;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final S3FileService s3FileService;
    private final ShareService shareService;

    // 프로필 응답 조회
    @Transactional(readOnly = true)
    @Cacheable(value = "profile", key = "#profileMember.id + ':' + (#viewerId == null ? 'anon' : #viewerId)")
    public ProfileViewResponseDTO getProfile(MemberVO profileMember, Long viewerId) {
        boolean isOwner = viewerId != null && profileMember.getId().equals(viewerId);
        boolean isFollowing = viewerId != null && !isOwner && followService.isFollowing(viewerId, profileMember.getId());
        boolean isBlocked = viewerId != null && !isOwner && blockService.isBlocked(viewerId, profileMember.getId());

        return ProfileViewResponseDTO.builder()
                .id(profileMember.getId())
                .nickname(profileMember.getNickname())
                .realName(profileMember.getRealName())
                .bio(profileMember.getBio())
                .profileImage(s3FileService.getPresignedUrl(profileMember.getProfileImage()))
                .bannerImage(s3FileService.getPresignedUrl(profileMember.getBannerImage()))
                .creatorVerified(profileMember.getCreatorVerified())
                .sellerVerified(profileMember.getSellerVerified())
                .creatorTier(profileMember.getCreatorTier())
                .followerCount(zeroIfNull(profileMember.getFollowerCount()))
                .followingCount(zeroIfNull(profileMember.getFollowingCount()))
                .galleryCount(zeroIfNull(profileMember.getGalleryCount()))
                .workCount(memberRepository.countActiveWorksByMemberId(profileMember.getId()))
                .isOwner(isOwner)
                .isFollowing(isFollowing)
                .isBlocked(isBlocked)
                .shareUrl("/profile/" + profileMember.getNickname())
                .profileBadges(memberRepository.findDisplayedBadgesByMemberId(profileMember.getId()))
                .build();
    }

    // 내 프로필 조회
    @Transactional(readOnly = true)
    public ProfileViewResponseDTO getMyProfile(Long memberId) {
        MemberVO member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        return getProfile(member, memberId);
    }

    // 팔로우 상태 변경
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "profile", allEntries = true)
    public Map<String, Object> toggleFollow(Long currentMemberId, String nickname) {
        MemberVO member = memberRepository.findByNickname(nickname)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        Map<String, Object> result = followService.toggleFollow(currentMemberId, member.getId());
        MemberVO updatedMember = memberRepository.findById(member.getId())
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        ProfileViewResponseDTO profile = getProfile(updatedMember, currentMemberId);

        return Map.of(
                "followed", result.get("followed"),
                "profile", profile
        );
    }

    // 프로필 차단
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "profile", allEntries = true)
    public Map<String, Object> blockProfile(Long currentMemberId, String nickname) {
        MemberVO member = memberRepository.findByNickname(nickname)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        return blockService.block(currentMemberId, member.getId());
    }

    // 프로필 차단 해제
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "profile", allEntries = true)
    public Map<String, Object> unblockProfile(Long currentMemberId, String nickname) {
        MemberVO member = memberRepository.findByNickname(nickname)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        return blockService.unblock(currentMemberId, member.getId());
    }

    // 프로필 수정
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "profile", allEntries = true)
    public ProfileViewResponseDTO updateMyProfile(Long memberId, MemberUpdateRequestDTO requestDTO) {
        MemberVO member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        String nickname = normalizeText(requestDTO.getNickname(), member.getNickname());
        String realName = normalizeNullableText(requestDTO.getRealName(), member.getRealName());
        String bio = normalizeNullableText(requestDTO.getBio(), member.getBio());
        String profileImage = normalizeNullableText(requestDTO.getProfileImage(), member.getProfileImage());
        String phoneNumber = normalizeNullableText(requestDTO.getPhoneNumber(), member.getPhoneNumber());

        if (nickname == null || nickname.isBlank()) {
            throw new IllegalArgumentException("닉네임을 입력해 주세요.");
        }

        if (!member.getNickname().equals(nickname) && memberRepository.existsByNickname(nickname)) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        memberRepository.updateProfile(
                memberId,
                nickname,
                realName,
                bio,
                profileImage,
                member.getBannerImage(),
                phoneNumber
        );

        MemberVO updatedMember = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        return getProfile(updatedMember, memberId);
    }

    // 기본 프로필 수정
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "profile", allEntries = true)
    public ProfileViewResponseDTO updateMyProfileBasic(Long memberId, ProfileBasicUpdateRequestDTO requestDTO) {
        MemberVO member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        memberRepository.updateProfile(
                memberId,
                member.getNickname(),
                normalizeNullableText(requestDTO.getRealName(), member.getRealName()),
                normalizeNullableText(requestDTO.getBio(), member.getBio()),
                normalizeNullableText(requestDTO.getProfileImage(), member.getProfileImage()),
                normalizeNullableText(requestDTO.getBannerImage(), member.getBannerImage()),
                normalizeNullableText(requestDTO.getPhoneNumber(), member.getPhoneNumber())
        );

        return getMyProfile(memberId);
    }

    // 프로필 이미지 수정
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "profile", allEntries = true)
    public ProfileViewResponseDTO updateMyProfileImage(Long memberId, MultipartFile profileImageFile) {
        if (profileImageFile == null || profileImageFile.isEmpty()) {
            throw new IllegalArgumentException("프로필 이미지를 선택해 주세요.");
        }

        MemberVO member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        String uploadedKey = s3FileService.upload("profiles", profileImageFile);
        memberRepository.updateProfile(
                memberId,
                member.getNickname(),
                member.getRealName(),
                member.getBio(),
                uploadedKey,
                member.getBannerImage(),
                member.getPhoneNumber()
        );

        return getMyProfile(memberId);
    }

    // 배너 이미지 수정
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "profile", allEntries = true)
    public ProfileViewResponseDTO updateMyBannerImage(Long memberId, MultipartFile bannerImageFile) {
        if (bannerImageFile == null || bannerImageFile.isEmpty()) {
            throw new IllegalArgumentException("배너 이미지를 선택해 주세요.");
        }

        MemberVO member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        String uploadedKey = s3FileService.upload("profile-banners", bannerImageFile);
        memberRepository.updateProfile(
                memberId,
                member.getNickname(),
                member.getRealName(),
                member.getBio(),
                member.getProfileImage(),
                uploadedKey,
                member.getPhoneNumber()
        );

        return getMyProfile(memberId);
    }

    // 닉네임 수정
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "profile", allEntries = true)
    public ProfileViewResponseDTO updateMyNickname(Long memberId, NicknameUpdateRequestDTO requestDTO) {
        MemberVO member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        String nickname = requestDTO == null ? null : normalizeText(requestDTO.getNickname(), member.getNickname());
        if (nickname == null || nickname.isBlank()) {
            throw new IllegalArgumentException("닉네임을 입력해 주세요.");
        }
        if (!member.getNickname().equals(nickname) && memberRepository.existsByNickname(nickname)) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        memberRepository.updateProfile(
                memberId,
                nickname,
                member.getRealName(),
                member.getBio(),
                member.getProfileImage(),
                member.getBannerImage(),
                member.getPhoneNumber()
        );

        return getMyProfile(memberId);
    }

    // 비밀번호 수정
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "profile", allEntries = true)
    public void changePassword(Long memberId, PasswordChangeRequestDTO requestDTO) {
        MemberVO member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        if (member.getPassword() == null || member.getPassword().isBlank()) {
            throw new IllegalStateException("비밀번호 로그인 계정이 아닙니다.");
        }
        if (requestDTO.getCurrentPassword() == null || requestDTO.getCurrentPassword().isBlank()) {
            throw new IllegalArgumentException("현재 비밀번호를 입력해 주세요.");
        }
        if (!passwordEncoder.matches(requestDTO.getCurrentPassword(), member.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }
        if (requestDTO.getNewPassword() == null || requestDTO.getNewPassword().isBlank()) {
            throw new IllegalArgumentException("새 비밀번호를 입력해 주세요.");
        }
        if (!requestDTO.getNewPassword().equals(requestDTO.getConfirmPassword())) {
            throw new IllegalArgumentException("새 비밀번호가 일치하지 않습니다.");
        }

        memberRepository.updatePassword(memberId, passwordEncoder.encode(requestDTO.getNewPassword()));
    }

    // 차단 목록 조회
    @Transactional(readOnly = true)
    public PageResponseDTO<BlockResponseDTO> getMyBlocks(Long memberId, int page) {
        List<BlockResponseDTO> content = blockService.getBlockedMembers(memberId, page);
        int totalElements = content.size();

        return PageResponseDTO.<BlockResponseDTO>builder()
                .content(content)
                .page(page)
                .size(PAGE_SIZE)
                .totalElements((long) totalElements)
                .totalPages(totalElements == 0 ? 0 : page + 1)
                .build();
    }

    // 뱃지 관리 조회
    @Transactional(readOnly = true)
    public MyProfileBadgeManageResponseDTO getMyBadgeManage(Long memberId) {
        List<MemberBadgeResponseDTO> ownedBadges = memberRepository.findOwnedBadgesByMemberId(memberId);
        List<Long> displayedBadgeIds = ownedBadges.stream()
                .filter(badge -> Boolean.TRUE.equals(badge.getIsDisplayed()))
                .map(MemberBadgeResponseDTO::getBadgeId)
                .toList();

        return MyProfileBadgeManageResponseDTO.builder()
                .maxDisplayCount(MAX_DISPLAY_BADGES)
                .displayedBadgeIds(displayedBadgeIds)
                .ownedBadges(ownedBadges)
                .build();
    }

    // 공유 대상 조회
    @Transactional(readOnly = true)
    public List<MemberListResponseDTO> searchShareReceivers(Long currentMemberId, String keyword) {
        String safeKeyword = keyword == null ? "" : keyword.trim();
        return memberRepository.searchByKeyword(safeKeyword, currentMemberId, 20);
    }

    // 프로필 공유
    @Transactional(rollbackFor = Exception.class)
    public void shareProfile(Long currentMemberId, String nickname, ProfileShareRequestDTO requestDTO) {
        MemberVO targetProfile = memberRepository.findByNickname(nickname)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        MemberVO sender = memberRepository.findById(currentMemberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        List<Long> receiverIds = requestDTO == null || requestDTO.getReceiverIds() == null
                ? List.of()
                : requestDTO.getReceiverIds().stream().distinct().toList();

        String extraMessage = requestDTO.getMessage() == null ? "" : requestDTO.getMessage().trim();
        shareService.shareToMembers(
                currentMemberId,
                receiverIds,
                targetProfile.getNickname() + "님의 프로필을 공유했습니다.",
                "/profile/" + targetProfile.getNickname(),
                requestDTO.getShareUrl(),
                extraMessage
        );
    }

    // 차단 목록 해제
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "profile", allEntries = true)
    public void unblock(Long memberId, Long blockedId) {
        blockService.unblock(memberId, blockedId);
    }

    // 대표 뱃지 수정
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "profile", allEntries = true)
    public List<MemberBadgeResponseDTO> updateDisplayedBadges(Long memberId, List<Long> badgeIds) {
        List<Long> safeBadgeIds = badgeIds == null ? List.of() : badgeIds.stream().distinct().toList();
        if (safeBadgeIds.size() > MAX_DISPLAY_BADGES) {
            throw new IllegalArgumentException("대표 뱃지는 최대 2개까지 선택할 수 있습니다.");
        }

        List<MemberBadgeResponseDTO> ownedBadges = memberRepository.findOwnedBadgesByMemberId(memberId);
        Set<Long> ownedBadgeIds = new HashSet<>();
        ownedBadges.forEach(badge -> ownedBadgeIds.add(badge.getBadgeId()));

        for (Long badgeId : safeBadgeIds) {
            if (!ownedBadgeIds.contains(badgeId)) {
                throw new IllegalArgumentException("보유하지 않은 뱃지는 대표로 설정할 수 없습니다.");
            }
        }

        memberRepository.clearDisplayedBadges(memberId);
        if (!safeBadgeIds.isEmpty()) {
            memberRepository.displayBadges(memberId, safeBadgeIds);
        }

        return memberRepository.findDisplayedBadgesByMemberId(memberId);
    }

    private int zeroIfNull(Integer value) {
        return value == null ? 0 : value;
    }

    private String normalizeText(String requestedValue, String fallback) {
        if (requestedValue == null) {
            return fallback;
        }
        String normalized = requestedValue.trim();
        return normalized.isBlank() ? fallback : normalized;
    }

    private String normalizeNullableText(String requestedValue, String fallback) {
        if (requestedValue == null) {
            return fallback;
        }
        String normalized = requestedValue.trim();
        return normalized.isBlank() ? null : normalized;
    }

}
