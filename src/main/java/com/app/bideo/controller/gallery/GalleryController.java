package com.app.bideo.controller.gallery;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class GalleryController {

    @GetMapping("/gallery-register")
    public String goToGalleryRegisterDirect() {
        return "work/gallery-register";
    }

    @GetMapping("/gallery/gallery-register")
    public String goToGalleryRegister() {
        return "work/gallery-register";
    }

    @GetMapping("/gallery/{id}")
    public String galleryDetail(@PathVariable Long id) {
        return "work/gallerydetail";
    }
}
