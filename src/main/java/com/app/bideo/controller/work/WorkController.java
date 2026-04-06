package com.app.bideo.controller.work;

import com.app.bideo.dto.work.WorkDetailResponseDTO;
import com.app.bideo.service.gallery.GalleryService;
import com.app.bideo.service.work.WorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/work")
@RequiredArgsConstructor
public class WorkController {

    private final WorkService workService;
    private final GalleryService galleryService;

    // 작품 등록 페이지 이동
    @GetMapping("/work-register")
    public String goToWorkRegister(Model model) {
        model.addAttribute("editMode", false);
        model.addAttribute("galleries", galleryService.getProfileGalleries());
        return "work/work-register";
    }

    // 작품 수정 페이지 이동
    @GetMapping("/work-edit/{id}")
    public String goToWorkEdit(@PathVariable Long id, Model model) {
        WorkDetailResponseDTO work = workService.getWorkDetail(id);
        model.addAttribute("editMode", true);
        model.addAttribute("work", work);
        model.addAttribute("galleries", galleryService.getProfileGalleries());
        return "work/work-register";
    }

    // 작품 상세 페이지 이동
    @GetMapping("/detail/{id}")
    public String detail(@PathVariable Long id, Model model) {
        WorkDetailResponseDTO work = workService.getWorkDetail(id);
        model.addAttribute("work", work);
        return "work/workdetail";
    }
}
