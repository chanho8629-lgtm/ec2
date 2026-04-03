package com.app.bideo.controller.admin;

import com.app.bideo.dto.admin.AdminRestrictionSearchDTO;
import com.app.bideo.dto.admin.InquirySearchDTO;
import com.app.bideo.dto.admin.ReportSearchDTO;
import com.app.bideo.dto.member.MemberSearchDTO;
import com.app.bideo.service.admin.AdminInquiryService;
import com.app.bideo.service.admin.AdminMemberService;
import com.app.bideo.service.admin.AdminReportService;
import com.app.bideo.service.admin.AdminRestrictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.ui.Model;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminPageController {

    private final AdminMemberService adminMemberService;
    private final AdminInquiryService adminInquiryService;
    private final AdminReportService adminReportService;
    private final AdminRestrictionService adminRestrictionService;

    @GetMapping("/members")
    public String memberList(MemberSearchDTO searchDTO, Model model) {
        model.addAttribute("members", adminMemberService.getMembers(searchDTO));
        model.addAttribute("search", searchDTO);
        return "admin/admin-member-list";
    }

    @GetMapping("/members/{id}")
    public String memberDetail(@PathVariable Long id, Model model) {
        model.addAttribute("member", adminMemberService.getMemberDetail(id));
        return "admin/admin-member-detail";
    }

    @GetMapping("/inquiries")
    public String inquiryList(InquirySearchDTO searchDTO, Model model) {
        model.addAttribute("inquiries", adminInquiryService.getInquiries(searchDTO));
        model.addAttribute("search", searchDTO);
        return "admin/admin-inquiry-list";
    }

    @GetMapping("/inquiries/{id}")
    public String inquiryDetail(@PathVariable Long id, Model model) {
        model.addAttribute("inquiry", adminInquiryService.getInquiryDetail(id));
        return "admin/admin-inquiry-detail";
    }

    @GetMapping("/restrictions")
    public String restrictionList(AdminRestrictionSearchDTO searchDTO, Model model) {
        model.addAttribute("restrictions", adminRestrictionService.getRestrictions(searchDTO));
        model.addAttribute("search", searchDTO);
        return "admin/admin-block-list";
    }

    @GetMapping("/reports")
    public String reportList(ReportSearchDTO searchDTO, Model model) {
        model.addAttribute("reports", adminReportService.getReports(searchDTO));
        model.addAttribute("search", searchDTO);
        return "admin/admin-report-list";
    }
}
