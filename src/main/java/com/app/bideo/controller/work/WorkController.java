package com.app.bideo.controller.work;

import com.app.bideo.dto.auction.AuctionDetailResponseDTO;
import com.app.bideo.dto.work.WorkDetailResponseDTO;
import com.app.bideo.service.auction.AuctionQueryService;
import com.app.bideo.service.gallery.GalleryService;
import com.app.bideo.service.work.WorkService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/work")
@RequiredArgsConstructor
public class WorkController {

    private final WorkService workService;
    private final GalleryService galleryService;
    private final AuctionQueryService auctionQueryService;

    // 작품 등록 페이지 이동
    @GetMapping("/work-register")
    public String goToWorkRegister(HttpServletRequest request, Model model) {
        model.addAttribute("editMode", false);
        model.addAttribute("galleries", galleryService.getProfileGalleries());
        model.addAttribute("embeddedMode", isEmbeddedRequest(request));
        return "work/work-register";
    }

    // 작품 수정 페이지 이동
    @GetMapping("/work-edit/{id}")
    public String goToWorkEdit(@PathVariable Long id, HttpServletRequest request, Model model) {
        WorkDetailResponseDTO work = workService.getWorkDetail(id);
        AuctionDetailResponseDTO activeAuction = null;

        if (Boolean.TRUE.equals(work.getHasActiveAuction())) {
            try {
                activeAuction = auctionQueryService.getActiveAuctionByWorkId(id);
            } catch (IllegalArgumentException ignored) {
                activeAuction = null;
            }
        }

        model.addAttribute("editMode", true);
        model.addAttribute("work", work);
        model.addAttribute("activeAuction", activeAuction);
        model.addAttribute("galleries", galleryService.getProfileGalleries());
        model.addAttribute("embeddedMode", isEmbeddedRequest(request));
        return "work/work-register";
    }

    // 작품 상세 페이지 이동
    @GetMapping("/detail/{id}")
    public String detail(@PathVariable Long id, Model model) {
        WorkDetailResponseDTO work = workService.getWorkDetail(id);
        model.addAttribute("work", work);
        return "work/workdetail";
    }

    // 쇼츠형 추천 피드 진입 — 시드 작품으로 시작, 이후 클라이언트가 무한 스크롤로 다음 작품 로드
    @GetMapping("/feed")
    public String feed(@RequestParam(required = false) String tag, Model model) {
        Long seedId = workService.resolveFeedSeedId(tag);
        if (seedId == null) {
            return "redirect:/";
        }
        WorkDetailResponseDTO work = workService.getWorkDetail(seedId);
        model.addAttribute("work", work);
        model.addAttribute("feedMode", true);
        model.addAttribute("feedTag", tag);
        return "work/workdetail";
    }

    private boolean isEmbeddedRequest(HttpServletRequest request) {
        return request != null && "XMLHttpRequest".equalsIgnoreCase(request.getHeader("X-Requested-With"));
    }
}
