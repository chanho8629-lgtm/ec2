package com.app.bideo.controller.auction;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/auction")
@RequiredArgsConstructor
public class AuctionController {

    @GetMapping("/auction-detail/{workId}")
    public String detail(@PathVariable Long workId, Model model) {
        model.addAttribute("workId", workId);
        return "auction/auction-detail";
    }
}
