package com.app.bideo.service.interaction;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.dto.common.LikeToggleResponseDTO;
import com.app.bideo.repository.interaction.CommentDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class CommentService {

    private final CommentDAO commentDAO;

    public LikeToggleResponseDTO toggleLike(Long commentId) {
        Long memberId = resolveMemberId();
        commentDAO.findId(commentId)
                .orElseThrow(() -> new IllegalArgumentException("comment not found"));

        boolean liked = commentDAO.existsLike(memberId, commentId);
        if (liked) {
            commentDAO.deleteLike(memberId, commentId);
            commentDAO.decreaseLikeCount(commentId);
        } else {
            commentDAO.saveLike(memberId, commentId);
            commentDAO.increaseLikeCount(commentId);
        }

        return LikeToggleResponseDTO.builder()
                .targetId(commentId)
                .targetType("COMMENT")
                .likeCount(commentDAO.findLikeCount(commentId))
                .liked(!liked)
                .build();
    }

    public boolean isLikedByCurrentMember(Long commentId) {
        Long memberId = resolveAuthenticatedMemberId();
        return memberId != null && commentDAO.existsLike(memberId, commentId);
    }

    private Long resolveMemberId() {
        Long memberId = resolveAuthenticatedMemberId();
        if (memberId != null) {
            return memberId;
        }
        throw new IllegalStateException("login required");
    }

    private Long resolveAuthenticatedMemberId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getId();
        }
        return null;
    }
}
