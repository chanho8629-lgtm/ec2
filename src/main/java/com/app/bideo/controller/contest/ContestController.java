package com.app.bideo.controller.contest;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.dto.contest.ContestCreateRequestDTO;
import com.app.bideo.dto.contest.ContestDetailResponseDTO;
import com.app.bideo.dto.contest.ContestEntryRequestDTO;
import com.app.bideo.dto.contest.ContestEntryResponseDTO;
import com.app.bideo.dto.contest.ContestListResponseDTO;
import com.app.bideo.dto.contest.ContestSearchDTO;
import com.app.bideo.dto.contest.ContestUpdateRequestDTO;
import com.app.bideo.dto.contest.ContestWorkOptionDTO;
import com.app.bideo.service.contest.ContestService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/contest")
@RequiredArgsConstructor
public class ContestController {

    private final ContestService contestService;

    @GetMapping("/list")
    public String list(@ModelAttribute ContestSearchDTO searchDTO, Model model) {
        PageResponseDTO<ContestListResponseDTO> result = contestService.getContestList(searchDTO);
        model.addAttribute("contestList", result.getContent());
        model.addAttribute("page", result);
        model.addAttribute("search", searchDTO);
        return "contest/contest-list";
    }

    @GetMapping("/api/list")
    @ResponseBody
    public PageResponseDTO<ContestListResponseDTO> apiList(
            @ModelAttribute ContestSearchDTO searchDTO,
            @RequestParam(defaultValue = "false") boolean mine,
            @RequestParam(defaultValue = "false") boolean participated,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (mine && userDetails != null) {
            searchDTO.setMemberId(userDetails.getId());
        }
        if (participated && userDetails != null) {
            searchDTO.setParticipatedMemberId(userDetails.getId());
        }
        return contestService.getContestList(searchDTO);
    }

    @GetMapping("/detail/{id}")
    public String detail(@PathVariable Long id,
                         @AuthenticationPrincipal CustomUserDetails userDetails,
                         Model model) {
        Long memberId = userDetails != null ? userDetails.getId() : null;
        ContestDetailResponseDTO contest = contestService.getContestDetail(id, memberId);
        boolean isOwner = userDetails != null && contest.getMemberId() != null && contest.getMemberId().equals(userDetails.getId());
        List<ContestEntryResponseDTO> entries = isOwner ? contestService.getContestEntryList(id) : Collections.emptyList();
        model.addAttribute("contest", contest);
        model.addAttribute("entries", entries);
        model.addAttribute("entryForm", ContestEntryRequestDTO.builder().contestId(id).build());
        model.addAttribute("isOwner", isOwner);
        model.addAttribute("canSelectWinner",
                isOwner
                        && contest.getWinnerNotifiedAt() == null
                        && contest.getEntryEnd() != null
                        && LocalDate.now().isAfter(contest.getEntryEnd()));
        if (userDetails != null && !isOwner) {
            List<ContestWorkOptionDTO> availableWorks = contestService.getEntryWorkOptions(userDetails.getId());
            model.addAttribute("availableWorks", availableWorks);
        }
        return "contest/contest-detail";
    }

    @GetMapping("/register")
    public String register(Model model) {
        model.addAttribute("contestForm", new ContestCreateRequestDTO());
        model.addAttribute("isEdit", false);
        return "contest/contest-register";
    }

    @PostMapping("/api/register")
    @ResponseBody
    public Map<String, Object> apiCreate(
            @ModelAttribute ContestCreateRequestDTO contestForm,
            @RequestParam(value = "coverFile", required = false) MultipartFile coverFile,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long contestId = contestService.createContest(userDetails.getId(), contestForm, coverFile);
        return Map.of("contestId", contestId);
    }

    @PostMapping("/api/{id}/edit")
    @ResponseBody
    public Map<String, Object> apiUpdate(
            @PathVariable Long id,
            @ModelAttribute ContestUpdateRequestDTO contestForm,
            @RequestParam(value = "coverFile", required = false) MultipartFile coverFile,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        contestService.updateContest(id, userDetails.getId(), contestForm, coverFile);
        return Map.of("contestId", id);
    }

    @PostMapping("/register")
    public String create(@ModelAttribute("contestForm") ContestCreateRequestDTO contestForm,
                         @AuthenticationPrincipal CustomUserDetails userDetails,
                         Model model) {
        try {
            Long contestId = contestService.createContest(userDetails.getId(), contestForm);
            return "redirect:/contest/detail/" + contestId;
        } catch (IllegalArgumentException e) {
            model.addAttribute("contestForm", contestForm);
            model.addAttribute("isEdit", false);
            model.addAttribute("errorMessage", e.getMessage());
            return "contest/contest-register";
        }
    }

    @GetMapping("/my-contests")
    public String myContests(@AuthenticationPrincipal CustomUserDetails userDetails, Model model) {
        PageResponseDTO<ContestListResponseDTO> result = contestService.getHostedContestList(userDetails.getId());
        model.addAttribute("contestList", result.getContent());
        model.addAttribute("page", result);
        return "contest/contestlist";
    }

    @GetMapping("/my-entries")
    public String myEntries(@AuthenticationPrincipal CustomUserDetails userDetails, Model model) {
        PageResponseDTO<ContestListResponseDTO> result = contestService.getParticipatedContestList(userDetails.getId());
        model.addAttribute("contestList", result.getContent());
        model.addAttribute("page", result);
        return "contest/mycontests";
    }

    @GetMapping("/{id}/edit")
    public String edit(@PathVariable Long id,
                       @AuthenticationPrincipal CustomUserDetails userDetails,
                       Model model) {
        Long memberId = userDetails != null ? userDetails.getId() : null;
        ContestDetailResponseDTO contest = contestService.getContestDetail(id, memberId);
        if (userDetails == null || contest.getMemberId() == null || !contest.getMemberId().equals(userDetails.getId())) {
            return "redirect:/contest/detail/" + id;
        }

        ContestUpdateRequestDTO contestForm = ContestUpdateRequestDTO.builder()
                .title(contest.getTitle())
                .organizer(contest.getOrganizer())
                .category(contest.getCategory())
                .description(contest.getDescription())
                .coverImage(contest.getCoverImage())
                .entryStart(contest.getEntryStart())
                .entryEnd(contest.getEntryEnd())
                .resultDate(contest.getResultDate())
                .prizeInfo(contest.getPrizeInfo())
                .price(contest.getPrice())
                .status(contest.getStatus())
                .build();

        model.addAttribute("contestForm", contestForm);
        model.addAttribute("isEdit", true);
        model.addAttribute("contestId", id);
        return "contest/contest-register";
    }

    @PostMapping("/{id}/entries")
    public String submitEntry(@PathVariable Long id,
                              @ModelAttribute("entryForm") ContestEntryRequestDTO entryForm,
                              @AuthenticationPrincipal CustomUserDetails userDetails,
                              RedirectAttributes redirectAttributes) {
        entryForm.setContestId(id);
        try {
            contestService.submitEntry(userDetails.getId(), entryForm);
            redirectAttributes.addFlashAttribute("successMessage", "출품이 완료되었습니다.");
        } catch (IllegalStateException e) {
            redirectAttributes.addFlashAttribute("errorMessage", "이미 참여한 작품입니다.");
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/contest/detail/" + id;
    }

    @PostMapping("/{id}/edit")
    public String update(@PathVariable Long id,
                         @ModelAttribute("contestForm") ContestUpdateRequestDTO contestForm,
                         @AuthenticationPrincipal CustomUserDetails userDetails,
                         RedirectAttributes redirectAttributes,
                         Model model) {
        try {
            contestService.updateContest(id, userDetails.getId(), contestForm);
            redirectAttributes.addFlashAttribute("successMessage", "공모전이 수정되었습니다.");
            return "redirect:/contest/detail/" + id;
        } catch (IllegalArgumentException e) {
            model.addAttribute("contestForm", contestForm);
            model.addAttribute("isEdit", true);
            model.addAttribute("contestId", id);
            model.addAttribute("errorMessage", e.getMessage());
            return "contest/contest-register";
        }
    }

    @PostMapping("/{id}/winner")
    public String selectWinner(@PathVariable Long id,
                               @RequestParam Long entryId,
                               @AuthenticationPrincipal CustomUserDetails userDetails,
                               RedirectAttributes redirectAttributes) {
        try {
            contestService.selectWinner(id, userDetails.getId(), entryId);
            redirectAttributes.addFlashAttribute("successMessage", "우승작이 저장되었습니다.");
        } catch (IllegalStateException | IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/contest/detail/" + id;
    }
}
