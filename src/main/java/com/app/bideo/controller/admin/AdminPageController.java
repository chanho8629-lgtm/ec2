package com.app.bideo.controller.admin;

import com.app.bideo.dto.admin.AdminSearchDTO;
import com.app.bideo.dto.admin.ReportSearchDTO;
import com.app.bideo.dto.member.MemberSearchDTO;
import com.app.bideo.service.admin.AdminAuctionService;
import com.app.bideo.service.admin.AdminMemberService;
import com.app.bideo.service.admin.AdminPaymentService;
import com.app.bideo.service.admin.AdminReportService;
import com.app.bideo.service.admin.AdminWithdrawalService;
import com.app.bideo.service.admin.AdminWorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminPageController {

    private final AdminMemberService adminMemberService;
    private final AdminWorkService adminWorkService;
    private final AdminAuctionService adminAuctionService;
    private final AdminPaymentService adminPaymentService;
    private final AdminReportService adminReportService;
    private final AdminWithdrawalService adminWithdrawalService;

    @GetMapping
    public String adminPage() {
        return "admin/admin";
    }

    @GetMapping("/members")
    public String memberList(MemberSearchDTO searchDTO, Model model) {
        searchDTO.normalize();
        model.addAttribute("memberList", adminMemberService.getMembers(searchDTO));
        model.addAttribute("totalCount", adminMemberService.getMemberCount(searchDTO));
        return "admin/admin-member-list";
    }

    @GetMapping("/members/{id}")
    public String memberDetail(@PathVariable Long id, Model model) {
        model.addAttribute("member", adminMemberService.getMemberDetail(id));
        return "admin/admin-member-detail";
    }

    @GetMapping("/artworks")
    public String artworkList(AdminSearchDTO searchDTO, Model model) {
        searchDTO.normalize();
        model.addAttribute("artworkList", adminWorkService.getWorks(searchDTO));
        model.addAttribute("totalCount", adminWorkService.getWorkCount(searchDTO));
        return "admin/admin-artwork-list";
    }

    @GetMapping("/artworks/{id}")
    public String artworkDetail(@PathVariable Long id, Model model) {
        model.addAttribute("artwork", adminWorkService.getWorkDetail(id));
        return "admin/admin-artwork-detail";
    }

    @GetMapping("/auctions")
    public String auctionList(AdminSearchDTO searchDTO, Model model) {
        searchDTO.normalize();
        model.addAttribute("auctionList", adminAuctionService.getAuctions(searchDTO));
        model.addAttribute("totalCount", adminAuctionService.getAuctionCount(searchDTO));
        return "admin/admin-auction-list";
    }

    @GetMapping("/auctions/{id}")
    public String auctionDetail(@PathVariable Long id, Model model) {
        model.addAttribute("auction", adminAuctionService.getAuctionDetail(id));
        return "admin/admin-auction-detail";
    }

    @GetMapping("/payments")
    public String paymentList(AdminSearchDTO searchDTO, Model model) {
        searchDTO.normalize();
        model.addAttribute("paymentList", adminPaymentService.getPayments(searchDTO));
        model.addAttribute("totalCount", adminPaymentService.getPaymentCount(searchDTO));
        return "admin/admin-payment-list";
    }

    @GetMapping("/payments/{id}")
    public String paymentDetail(@PathVariable Long id, Model model) {
        model.addAttribute("payment", adminPaymentService.getPaymentDetail(id));
        return "admin/admin-payment-detail";
    }

    @GetMapping("/reports")
    public String reportList(ReportSearchDTO searchDTO, Model model) {
        searchDTO.normalize();
        model.addAttribute("reportList", adminReportService.getReports(searchDTO));
        model.addAttribute("totalCount", adminReportService.getReportCount(searchDTO));
        return "admin/admin-report-list";
    }

    @GetMapping("/reports/{id}")
    public String reportDetail(@PathVariable Long id, Model model) {
        model.addAttribute("report", adminReportService.getReportDetail(id));
        return "admin/admin-report-detail";
    }

    @GetMapping("/withdrawals")
    public String withdrawalList(AdminSearchDTO searchDTO, Model model) {
        searchDTO.normalize();
        model.addAttribute("withdrawalList", adminWithdrawalService.getWithdrawals(searchDTO));
        model.addAttribute("totalCount", adminWithdrawalService.getWithdrawalCount(searchDTO));
        return "admin/admin-withdrawal-list";
    }

    @GetMapping("/withdrawals/{id}")
    public String withdrawalDetail(@PathVariable Long id, Model model) {
        model.addAttribute("withdrawal", adminWithdrawalService.getWithdrawalDetail(id));
        return "admin/admin-withdrawal-detail";
    }
}
