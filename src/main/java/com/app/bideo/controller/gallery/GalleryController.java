package com.app.bideo.controller.gallery;

import com.app.bideo.dto.gallery.GalleryDetailResponseDTO;
import com.app.bideo.service.gallery.GalleryService;
import com.app.bideo.service.work.WorkService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Collections;

@Controller
@RequiredArgsConstructor
public class GalleryController {

    private final WorkService workService;
    private final GalleryService galleryService;

    // 예술관 등록 페이지를 직접 열 때 사용할 초기 데이터를 준비한다.
    @GetMapping("/gallery-register")
    public String goToGalleryRegisterDirect(HttpServletRequest request, Model model) {
        model.addAttribute("works", getGalleryRegisterWorks());
        model.addAttribute("embeddedMode", isEmbeddedRequest(request));
        return "work/gallery-register";
    }

    // 공통 예술관 등록 경로를 열고 임베드 여부를 함께 전달한다.
    @GetMapping("/gallery/gallery-register")
    public String goToGalleryRegister(HttpServletRequest request, Model model) {
        model.addAttribute("works", getGalleryRegisterWorks());
        model.addAttribute("embeddedMode", isEmbeddedRequest(request));
        return "work/gallery-register";
    }

    // 예술관 상세를 렌더링하기 전에 조회수를 1 증가시킨다.
    @GetMapping("/gallery/{id}")
    public String galleryDetail(@PathVariable Long id, Model model) {
        galleryService.increaseViewCount(id);
        GalleryDetailResponseDTO gallery = galleryService.getGalleryDetail(id);
        model.addAttribute("gallery", gallery);
        return "work/gallerydetail";
    }

    // 예술관 수정 화면에 현재 예술관과 연결 가능한 작품 목록을 전달한다.
    @GetMapping("/gallery/{id}/edit")
    public String galleryEdit(@PathVariable Long id, HttpServletRequest request, Model model) {
        GalleryDetailResponseDTO gallery = galleryService.getGalleryDetail(id);
        model.addAttribute("gallery", gallery);
        model.addAttribute("works", workService.getProfileWorks(gallery.getMemberId(), null));
        model.addAttribute("isEditMode", true);
        model.addAttribute("embeddedMode", isEmbeddedRequest(request));
        return "work/gallery-register";
    }

    // 로그인 사용자의 작품 목록을 등록 화면 초기값으로 조회한다.
    private Object getGalleryRegisterWorks() {
        try {
            return workService.getProfileWorks((Long) null);
        } catch (IllegalStateException exception) {
            return Collections.emptyList();
        }
    }

    // 레이아웃 내부 로드 요청인지 여부를 판별한다.
    private boolean isEmbeddedRequest(HttpServletRequest request) {
        return request != null && "XMLHttpRequest".equalsIgnoreCase(request.getHeader("X-Requested-With"));
    }
}
