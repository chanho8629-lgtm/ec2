package com.app.bideo.controller.interaction;

import com.app.bideo.dto.common.LikeToggleResponseDTO;
import com.app.bideo.dto.interaction.CommentResponseDTO;
import com.app.bideo.dto.interaction.CommentUpdateRequestDTO;
import com.app.bideo.service.interaction.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentAPIController {

    private final CommentService commentService;

    @PostMapping("/{id}/likes")
    public LikeToggleResponseDTO toggleLike(@PathVariable Long id) {
        return commentService.toggleLike(id);
    }

    @PutMapping("/{id}")
    public CommentResponseDTO update(@PathVariable Long id, @RequestBody CommentUpdateRequestDTO requestDTO) {
        return commentService.update(id, requestDTO.getContent());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        commentService.delete(id);
    }
}
