package com.app.bideo.controller.search;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SearchController {

    @GetMapping("/results")
    public String searchResults() {
        return "explore-result/explore-result";
    }
}
