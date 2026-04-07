package com.app.bideo.controller.profile;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.domain.member.MemberVO;
import com.app.bideo.repository.member.MemberRepository;
import com.app.bideo.service.gallery.GalleryService;
import com.app.bideo.service.member.FollowService;
import com.app.bideo.service.work.WorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final WorkService workService;
    private final GalleryService galleryService;
    private final FollowService followService;
    private final MemberRepository memberRepository; // 이승민| 프로필 닉네임 경로 적용으로 인한 추가

    @GetMapping
    public String redirectProfile(@AuthenticationPrincipal CustomUserDetails userDetails,
                                  @RequestParam(required = false) Long galleryId,
                                  @RequestParam(required = false) String tab,
                                  Model model) { // 이승민| 프로필 닉네임 경로 적용으로 인한 추가
        if (userDetails == null || userDetails.getId() == null) {
            return "redirect:/";
        }

        MemberVO profileMember = memberRepository.findById(userDetails.getId()).orElse(null);
        if (profileMember == null) {
            return "redirect:/";
        }

        return renderProfilePage(profileMember, galleryId, tab, userDetails, model);
    }

    @GetMapping("/{nickname}")
    public String profile(@PathVariable String nickname,
                          @RequestParam(required = false) Long galleryId,
                          @RequestParam(required = false) String tab, // 이승민| 프로필 닉네임 경로 적용으로 인한 수정
                          @AuthenticationPrincipal CustomUserDetails userDetails, Model model) {
        MemberVO profileMember = memberRepository.findByNickname(nickname).orElse(null);
        if (profileMember == null) {
            return "redirect:/error-page";
        }

        return renderProfilePage(profileMember, galleryId, tab, userDetails, model);
    }

    private String renderProfilePage(MemberVO profileMember, Long galleryId, String tab,
                                     CustomUserDetails userDetails, Model model) {
        boolean isOwner = userDetails != null && profileMember.getId().equals(userDetails.getId());
        boolean isFollowing = userDetails != null
                && !isOwner
                && followService.isFollowing(userDetails.getId(), profileMember.getId());
        String resolvedTab = "works".equalsIgnoreCase(tab) ? "works" : "galleries";
        model.addAttribute("works", workService.getProfileWorks(profileMember.getId(), galleryId));
        model.addAttribute("galleries", galleryService.getProfileGalleries(profileMember.getId()));
        model.addAttribute("selectedGalleryId", galleryId);
        model.addAttribute("selectedTab", resolvedTab);
        model.addAttribute("profilePath", "/profile/" + profileMember.getNickname()); // 이승민| 프로필 닉네임 경로 유지로 인한 추가
        model.addAttribute("profileMember", profileMember); // 이승민| 프로필 상단 실데이터 노출로 인한 추가
        model.addAttribute("profileNickname", profileMember.getNickname()); // 이승민| 프로필 닉네임 경로 적용으로 인한 수정
        model.addAttribute("isOwner", isOwner); // 이승민| 프로필 닉네임 경로 적용으로 인한 추가
        model.addAttribute("isFollowing", isFollowing);
        return "profile/profile";
    }
}
