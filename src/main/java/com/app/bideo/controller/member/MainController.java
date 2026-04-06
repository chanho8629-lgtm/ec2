package com.app.bideo.controller.member;

import com.app.bideo.dto.gallery.GalleryListResponseDTO;
import com.app.bideo.dto.gallery.GallerySearchDTO;
import com.app.bideo.service.gallery.GalleryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class MainController {

    private final GalleryService galleryService;

    @GetMapping("/")
    public String root(Authentication authentication, Model model) {
        boolean isLoggedIn = authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
        model.addAttribute("isLoggedIn", isLoggedIn);
        if (isLoggedIn) {
            addGalleryData(model);
            return "main/main";
        }
        return "main/intro-main";
    }

    @GetMapping("/main")
    public String main(Model model) {
        model.addAttribute("isLoggedIn", false);
        addGalleryData(model);
        return "main/main";
    }

    @GetMapping("/error-page")
    public String errorPage() {
        return "error/error";
    }

    private void addGalleryData(Model model) {
        GallerySearchDTO searchDTO = new GallerySearchDTO();
        searchDTO.setPage(1);
        searchDTO.setSize(20);
        List<GalleryListResponseDTO> galleries = galleryService.getGalleryList(searchDTO).getContent();
        model.addAttribute("galleries", galleries);
    }
}
