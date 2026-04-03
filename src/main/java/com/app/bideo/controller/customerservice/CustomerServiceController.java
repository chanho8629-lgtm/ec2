package com.app.bideo.controller.customerservice;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/customerservice")
public class CustomerServiceController {

    // 고객센터 메인
    @GetMapping
    public String customerService() {
        return "customerservice/customerservice";
    }

    // 고객센터 검색결과 목록
    @GetMapping("/list")
    public String customerServiceList() {
        return "customerservice/customerservicelist";
    }

    // 고객센터 상세
    @GetMapping("/detail")
    public String customerDetail() {
        return "customerservice/customerdetail";
    }
}
