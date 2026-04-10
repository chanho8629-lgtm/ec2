package com.app.bideo.controller.payment;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/payment")
public class PaymentViewController {

    @GetMapping("/pay")
    public String pay() {
        return "work/pay";
    }

    @GetMapping("/pay-api")
    public String payApi() {
        return "pay/pay-api";
    }

    @GetMapping("/history")
    public String history() {
        return "paymentdetail/paymentlist";
    }
}
