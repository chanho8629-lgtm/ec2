package com.app.bideo.controller.dashboard;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.service.dashboard.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // 로그인 사용자의 대시보드 화면에 필요한 집계 데이터를 바인딩한다.
    @GetMapping
    public String dashboard(@AuthenticationPrincipal CustomUserDetails userDetails, Model model) {
        model.addAttribute("dashboard", dashboardService.getDashboard(userDetails.getId()));
        return "dashboard/dashboard";
    }
}
