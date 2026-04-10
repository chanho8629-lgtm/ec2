package com.app.bideo.controller.profile;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.domain.member.MemberVO;
import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.dto.member.BlockResponseDTO;
import com.app.bideo.dto.member.FollowResponseDTO;
import com.app.bideo.dto.member.MemberBadgeResponseDTO;
import com.app.bideo.dto.member.MemberListResponseDTO;
import com.app.bideo.dto.member.MemberUpdateRequestDTO;
import com.app.bideo.dto.member.MyProfileBadgeManageResponseDTO;
import com.app.bideo.dto.member.NicknameUpdateRequestDTO;
import com.app.bideo.dto.member.PasswordChangeRequestDTO;
import com.app.bideo.dto.member.ProfileBasicUpdateRequestDTO;
import com.app.bideo.dto.member.ProfileShareRequestDTO;
import com.app.bideo.dto.member.ProfileViewResponseDTO;
import com.app.bideo.repository.member.MemberRepository;
import com.app.bideo.service.member.FollowService;
import com.app.bideo.service.profile.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileAPIController {

    private final MemberRepository memberRepository;
    private final FollowService followService;
    private final ProfileService profileService;

    // 내 프로필 조회
    @GetMapping("/me")
    public ResponseEntity<ProfileViewResponseDTO> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(profileService.getMyProfile(userDetails.getId()));
    }

    // 프로필 조회
    @GetMapping("/{nickname}")
    public ResponseEntity<ProfileViewResponseDTO> getProfile(
            @PathVariable String nickname,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        MemberVO member = memberRepository.findByNickname(nickname)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        Long viewerId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(profileService.getProfile(member, viewerId));
    }

    // 팔로우 상태 변경
    @PostMapping("/{nickname}/follow")
    public ResponseEntity<Map<String, Object>> toggleFollow(
            @PathVariable String nickname,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(profileService.toggleFollow(userDetails.getId(), nickname));
    }

    // 프로필 차단
    @PostMapping("/{nickname}/block")
    public ResponseEntity<Map<String, Object>> blockProfile(
            @PathVariable String nickname,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(profileService.blockProfile(userDetails.getId(), nickname));
    }

    // 프로필 차단 해제
    @DeleteMapping("/{nickname}/block")
    public ResponseEntity<Map<String, Object>> unblockProfile(
            @PathVariable String nickname,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(profileService.unblockProfile(userDetails.getId(), nickname));
    }

    // 공유 대상 조회
    @GetMapping("/{nickname}/share/receivers")
    public ResponseEntity<List<MemberListResponseDTO>> searchShareReceivers(
            @PathVariable String nickname,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "") String keyword) {
        memberRepository.findByNickname(nickname)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        return ResponseEntity.ok(profileService.searchShareReceivers(userDetails.getId(), keyword));
    }

    // 프로필 공유
    @PostMapping("/{nickname}/share")
    public ResponseEntity<Void> shareProfile(
            @PathVariable String nickname,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ProfileShareRequestDTO requestDTO) {
        profileService.shareProfile(userDetails.getId(), nickname, requestDTO);
        return ResponseEntity.ok().build();
    }

    // 프로필 수정
    @PutMapping("/me")
    public ResponseEntity<ProfileViewResponseDTO> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody MemberUpdateRequestDTO requestDTO) {
        return ResponseEntity.ok(profileService.updateMyProfile(userDetails.getId(), requestDTO));
    }

    // 기본 프로필 수정
    @PutMapping("/me/basic")
    public ResponseEntity<ProfileViewResponseDTO> updateMyProfileBasic(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ProfileBasicUpdateRequestDTO requestDTO) {
        return ResponseEntity.ok(profileService.updateMyProfileBasic(userDetails.getId(), requestDTO));
    }

    // 프로필 이미지 수정
    @PostMapping("/me/profile-image")
    public ResponseEntity<ProfileViewResponseDTO> updateMyProfileImage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("profileImageFile") MultipartFile profileImageFile) {
        return ResponseEntity.ok(profileService.updateMyProfileImage(userDetails.getId(), profileImageFile));
    }

    // 배너 이미지 수정
    @PostMapping("/me/banner-image")
    public ResponseEntity<ProfileViewResponseDTO> updateMyBannerImage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("bannerImageFile") MultipartFile bannerImageFile) {
        return ResponseEntity.ok(profileService.updateMyBannerImage(userDetails.getId(), bannerImageFile));
    }

    // 닉네임 수정
    @PutMapping("/me/nickname")
    public ResponseEntity<ProfileViewResponseDTO> updateMyNickname(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody NicknameUpdateRequestDTO requestDTO) {
        return ResponseEntity.ok(profileService.updateMyNickname(userDetails.getId(), requestDTO));
    }

    // 비밀번호 수정
    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody PasswordChangeRequestDTO requestDTO) {
        profileService.changePassword(userDetails.getId(), requestDTO);
        return ResponseEntity.ok().build();
    }

    // 내 팔로워 조회
    @GetMapping("/me/followers")
    public ResponseEntity<List<FollowResponseDTO>> getMyFollowers(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(followService.getFollowers(userDetails.getId(), userDetails.getId(), page));
    }

    // 내 팔로잉 조회
    @GetMapping("/me/followings")
    public ResponseEntity<List<FollowResponseDTO>> getMyFollowings(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(followService.getFollowings(userDetails.getId(), userDetails.getId(), page));
    }

    // 프로필 팔로워 조회
    @GetMapping("/{nickname}/followers")
    public ResponseEntity<List<FollowResponseDTO>> getFollowers(
            @PathVariable String nickname,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page) {
        MemberVO member = memberRepository.findByNickname(nickname)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        Long viewerId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(followService.getFollowers(member.getId(), viewerId, page));
    }

    // 프로필 팔로잉 조회
    @GetMapping("/{nickname}/followings")
    public ResponseEntity<List<FollowResponseDTO>> getFollowings(
            @PathVariable String nickname,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page) {
        MemberVO member = memberRepository.findByNickname(nickname)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        Long viewerId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(followService.getFollowings(member.getId(), viewerId, page));
    }

    // 내 차단 목록 조회
    @GetMapping("/me/blocks")
    public ResponseEntity<PageResponseDTO<BlockResponseDTO>> getMyBlocks(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(profileService.getMyBlocks(userDetails.getId(), page));
    }

    // 내 뱃지 조회
    @GetMapping("/me/badges")
    public ResponseEntity<MyProfileBadgeManageResponseDTO> getMyBadgeManage(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(profileService.getMyBadgeManage(userDetails.getId()));
    }

    // 차단 목록 해제
    @DeleteMapping("/me/blocks")
    public ResponseEntity<Void> unblock(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam Long blockedId) {
        profileService.unblock(userDetails.getId(), blockedId);
        return ResponseEntity.ok().build();
    }

    // 대표 뱃지 수정
    @PutMapping("/me/badges/display")
    public ResponseEntity<List<MemberBadgeResponseDTO>> updateDisplayedBadges(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody List<Long> badgeIds) {
        return ResponseEntity.ok(profileService.updateDisplayedBadges(userDetails.getId(), badgeIds));
    }
}
