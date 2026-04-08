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

    @GetMapping("/gallery-register")
    public String goToGalleryRegisterDirect(HttpServletRequest request, Model model) {
        model.addAttribute("works", getGalleryRegisterWorks());
        model.addAttribute("embeddedMode", isEmbeddedRequest(request));
        return "work/gallery-register";
    }

    @GetMapping("/gallery/gallery-register")
    public String goToGalleryRegister(HttpServletRequest request, Model model) {
        model.addAttribute("works", getGalleryRegisterWorks());
        model.addAttribute("embeddedMode", isEmbeddedRequest(request));
        return "work/gallery-register";
    }

    @GetMapping("/gallery/{id}")
    public String galleryDetail(@PathVariable Long id, Model model) {
        galleryService.increaseViewCount(id);
        GalleryDetailResponseDTO gallery = galleryService.getGalleryDetail(id);
        model.addAttribute("gallery", gallery);
        return "work/gallerydetail";
    }

    @GetMapping("/gallery/{id}/edit")
    public String galleryEdit(@PathVariable Long id, HttpServletRequest request, Model model) {
        GalleryDetailResponseDTO gallery = galleryService.getGalleryDetail(id);
        model.addAttribute("gallery", gallery);
        model.addAttribute("works", workService.getProfileWorks(gallery.getMemberId(), null));
        model.addAttribute("isEditMode", true);
        model.addAttribute("embeddedMode", isEmbeddedRequest(request));
        return "work/gallery-register";
    }

    private Object getGalleryRegisterWorks() {
        try {
            return workService.getProfileWorks((Long) null);
        } catch (IllegalStateException exception) {
            return Collections.emptyList();
        }
    }

    private boolean isEmbeddedRequest(HttpServletRequest request) {
        return request != null && "XMLHttpRequest".equalsIgnoreCase(request.getHeader("X-Requested-With"));
    }
}
