package com.app.bideo.controller.gallery;

import com.app.bideo.dto.gallery.GalleryDetailResponseDTO;
import com.app.bideo.service.gallery.GalleryService;
import com.app.bideo.service.work.WorkService;
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
    public String goToGalleryRegisterDirect(Model model) {
        model.addAttribute("works", getGalleryRegisterWorks());
        return "work/gallery-register";
    }

    @GetMapping("/gallery/gallery-register")
    public String goToGalleryRegister(Model model) {
        model.addAttribute("works", getGalleryRegisterWorks());
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
    public String galleryEdit(@PathVariable Long id, Model model) {
        GalleryDetailResponseDTO gallery = galleryService.getGalleryDetail(id);
        model.addAttribute("gallery", gallery);
        model.addAttribute("works", workService.getProfileWorks(gallery.getMemberId(), null));
        model.addAttribute("isEditMode", true);
        return "work/gallery-register";
    }

    private Object getGalleryRegisterWorks() {
        try {
            return workService.getProfileWorks((Long) null);
        } catch (IllegalStateException exception) {
            return Collections.emptyList();
        }
    }
}
