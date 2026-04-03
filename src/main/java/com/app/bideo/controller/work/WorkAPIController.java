package com.app.bideo.controller.work;

import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.dto.common.LikeToggleResponseDTO;
import com.app.bideo.dto.interaction.CommentCreateRequestDTO;
import com.app.bideo.dto.work.WorkCreateRequestDTO;
import com.app.bideo.dto.work.WorkDetailResponseDTO;
import com.app.bideo.dto.work.WorkListResponseDTO;
import com.app.bideo.dto.work.WorkSearchDTO;
import com.app.bideo.dto.work.WorkUpdateRequestDTO;
import com.app.bideo.service.work.WorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/works")
@RequiredArgsConstructor
public class WorkAPIController {

    private final WorkService workService;

    // 작품 등록
    @PostMapping
    public WorkDetailResponseDTO write(
            @RequestParam(required = false) Long memberId,
            @ModelAttribute WorkCreateRequestDTO requestDTO,
            @RequestParam("mediaFile") MultipartFile mediaFile
    ) {
        return workService.write(memberId, requestDTO, mediaFile);
    }

    // 작품 목록 조회
    @GetMapping
    public PageResponseDTO<WorkListResponseDTO> list(@ModelAttribute WorkSearchDTO searchDTO) {
        return workService.getWorkList(searchDTO);
    }

    // 작품 상세 조회
    @GetMapping("/{id}")
    public WorkDetailResponseDTO detail(@PathVariable Long id) {
        return workService.getWorkDetail(id);
    }

    @PostMapping("/{id}/views")
    public void increaseViewCount(@PathVariable Long id) {
        workService.increaseViewCount(id);
    }

    // 작품 수정
    @PutMapping("/{id}")
    public WorkDetailResponseDTO update(
            @PathVariable Long id,
            @RequestParam(required = false) Long memberId,
            @RequestBody WorkUpdateRequestDTO requestDTO
    ) {
        return workService.update(id, memberId, requestDTO);
    }

    // 작품 수정 폼 저장
    @PostMapping("/{id}/edit")
    public WorkDetailResponseDTO updateFromForm(
            @PathVariable Long id,
            @RequestParam(required = false) Long memberId,
            @ModelAttribute WorkUpdateRequestDTO requestDTO,
            @RequestParam(required = false) MultipartFile mediaFile
    ) {
        return workService.update(id, memberId, requestDTO, mediaFile);
    }

    // 작품 댓글 등록
    @PostMapping("/{id}/comments")
    public WorkDetailResponseDTO writeComment(
            @PathVariable Long id,
            @RequestParam(required = false) Long memberId,
            @RequestBody CommentCreateRequestDTO requestDTO
    ) {
        return workService.writeComment(id, memberId, requestDTO.getContent());
    }

    @PostMapping("/{id}/likes")
    public LikeToggleResponseDTO toggleLike(
            @PathVariable Long id,
            @RequestParam(required = false) Long memberId
    ) {
        return workService.toggleLike(id, memberId);
    }

    // 작품 삭제
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        workService.delete(id);
    }
}
