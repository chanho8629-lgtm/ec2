package com.app.bideo.controller.gallery;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

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
}
