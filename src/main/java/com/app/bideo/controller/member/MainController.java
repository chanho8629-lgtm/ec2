package com.app.bideo.controller.member;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {
    @GetMapping("/")
    public String root(Authentication authentication, Model model) {
        boolean isLoggedIn = authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
        model.addAttribute("isLoggedIn", isLoggedIn);
        if (isLoggedIn) {
            return "main/main";
        }
        return "main/intro-main";
    }

    @GetMapping("/main")
    public String main(Model model) {
        model.addAttribute("isLoggedIn", false);
        return "main/main";
    }

    @GetMapping("/error-page")
    public String errorPage() {
        return "error/error";
    }
}
