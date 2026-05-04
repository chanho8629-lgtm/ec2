package com.app.bideo.controller.profile;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.domain.member.MemberVO;
import com.app.bideo.dto.gallery.GalleryListResponseDTO;
import com.app.bideo.dto.member.ProfileViewResponseDTO;
import com.app.bideo.dto.work.WorkListResponseDTO;
import com.app.bideo.repository.member.MemberRepository;
import com.app.bideo.service.gallery.GalleryService;
import com.app.bideo.service.profile.ProfileService;
import com.app.bideo.service.work.WorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final WorkService workService;
    private final GalleryService galleryService;
    private final MemberRepository memberRepository;
    private final ProfileService profileService;

    @GetMapping
    public String redirectProfile(@AuthenticationPrincipal CustomUserDetails userDetails,
                                  @RequestParam(required = false) Long galleryId,
                                  @RequestParam(required = false) String tab,
                                  Model model) {
        if (userDetails == null || userDetails.getId() == null) {
            return "/";
        }

        MemberVO profileMember = memberRepository.findById(userDetails.getId()).orElse(null);
        if (profileMember == null) {
            return "/";
        }

        return renderProfilePage(profileMember, galleryId, tab, userDetails, model);
    }

    @GetMapping("/{nickname}")
    public String profile(@PathVariable String nickname,
                          @RequestParam(required = false) Long galleryId,
                          @RequestParam(required = false) String tab,
                          @AuthenticationPrincipal CustomUserDetails userDetails,
                          Model model) {
        MemberVO profileMember = memberRepository.findByNickname(nickname).orElse(null);
        if (profileMember == null) {
            return "/error-page";
        }

        return renderProfilePage(profileMember, galleryId, tab, userDetails, model);
    }

    private String renderProfilePage(MemberVO profileMember,
                                     Long galleryId,
                                     String tab,
                                     CustomUserDetails userDetails,
                                     Model model) {
        Long viewerId = userDetails != null ? userDetails.getId() : null;
        String selectedTab = "works".equalsIgnoreCase(tab) ? "works" : "galleries";
        ProfileViewResponseDTO profile = profileService.getProfile(profileMember, viewerId);
        boolean blockedProfile = Boolean.TRUE.equals(profile.getIsBlocked()) && !Boolean.TRUE.equals(profile.getIsOwner());
        List<WorkListResponseDTO> works = blockedProfile
                ? List.of()
                : workService.getProfileWorks(profileMember.getId(), galleryId);
        List<GalleryListResponseDTO> galleries = blockedProfile
                ? List.of()
                : galleryService.getProfileGalleries(profileMember.getId());

        model.addAttribute("works", works);
        model.addAttribute("galleries", galleries);
        model.addAttribute("workCount", works.size());
        model.addAttribute("galleryCount", galleries.size());
        model.addAttribute("blockedProfile", blockedProfile);
        model.addAttribute("selectedTab", selectedTab);
        model.addAttribute("selectedGalleryId", galleryId);
        model.addAttribute("profile", profile);
        model.addAttribute("profileBadges", profile.getProfileBadges());
        model.addAttribute("profilePath", profile.getShareUrl());
        model.addAttribute("profileMember", profileMember);
        model.addAttribute("profileNickname", profile.getNickname());
        model.addAttribute("isOwner", profile.getIsOwner());
        model.addAttribute("isFollowing", profile.getIsFollowing());
        return Boolean.TRUE.equals(profile.getIsOwner()) ? "profile/profile-my" : "profile/profile";
    }
}
