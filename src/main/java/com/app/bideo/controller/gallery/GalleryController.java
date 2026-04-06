package com.app.bideo.controller.gallery;

import com.app.bideo.dto.gallery.GalleryDetailResponseDTO;
import com.app.bideo.service.gallery.GalleryService;
import com.app.bideo.service.work.WorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
@RequiredArgsConstructor
public class GalleryController {

    private final WorkService workService;
    private final GalleryService galleryService;

    @GetMapping("/gallery-register")
    public String goToGalleryRegisterDirect(Model model) {
        model.addAttribute("works", workService.getProfileWorks((Long) null));
        return "work/gallery-register";
    }

    @GetMapping("/gallery/gallery-register")
    public String goToGalleryRegister(Model model) {
        model.addAttribute("works", workService.getProfileWorks((Long) null));
        return "work/gallery-register";
    }

    @GetMapping("/gallery/{id}")
    public String galleryDetail(@PathVariable Long id) {
        return "work/gallerydetail";
    }
}
