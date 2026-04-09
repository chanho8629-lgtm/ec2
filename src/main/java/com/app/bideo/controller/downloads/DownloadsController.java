package com.app.bideo.controller.downloads;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/downloads")
@RequiredArgsConstructor
public class DownloadsController {
    @GetMapping("")
    public String downloads() {
        return "downloads/downloads";
    }
}

