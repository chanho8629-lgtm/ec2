package com.app.bideo.controller.interaction;

import com.app.bideo.dto.common.LikeToggleResponseDTO;
import com.app.bideo.service.interaction.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
}
