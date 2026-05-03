package com.app.bideo.controller.payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/payment")
public class PaymentViewController {

    @Value("${bootpay.js-application-id:}")
    private String bootpayJsApplicationId;

    @Value("${boot-pay.billing.pg:${bootpay.pg:토스}}")
    private String bootpayPg;

    @GetMapping("/pay")
    public String pay(Model model) {
        bindBootpayConfig(model);
        return "work/pay";
    }

    @GetMapping("/pay-api")
    public String payApi(Model model) {
        bindBootpayConfig(model);
        return "work/pay";
    }

    private void bindBootpayConfig(Model model) {
        model.addAttribute("bootpayJsApplicationId", bootpayJsApplicationId);
        model.addAttribute("bootpayPg", bootpayPg);
    }

    @GetMapping("/history")
    public String history() {
        return "paymentdetail/paymentlist";
    }
}
