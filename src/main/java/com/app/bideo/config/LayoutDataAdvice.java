package com.app.bideo.config;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.dto.common.TagResponseDTO;
import com.app.bideo.dto.member.FollowResponseDTO;
import com.app.bideo.repository.gallery.GalleryDAO;
import com.app.bideo.service.member.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.util.Collections;
import java.util.List;

@ControllerAdvice
@RequiredArgsConstructor
public class LayoutDataAdvice {

    private final FollowService followService;
    private final GalleryDAO galleryDAO;

    @ModelAttribute("followingArtists")
    public List<FollowResponseDTO> followingArtists() {
        Long memberId = getCurrentMemberId();
        if (memberId == null) {
            return Collections.emptyList();
        }
        return followService.getFollowings(memberId, memberId, 0);
    }

    @ModelAttribute("popularTags")
    public List<TagResponseDTO> popularTags() {
        return galleryDAO.findPopularTags(10);
    }

    private Long getCurrentMemberId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getId();
        }
        return null;
    }
}
