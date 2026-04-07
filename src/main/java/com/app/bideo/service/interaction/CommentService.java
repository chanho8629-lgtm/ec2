package com.app.bideo.service.interaction;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.dto.common.LikeToggleResponseDTO;
import com.app.bideo.dto.interaction.CommentResponseDTO;
import com.app.bideo.repository.gallery.GalleryDAO;
import com.app.bideo.repository.interaction.CommentDAO;
import com.app.bideo.repository.work.WorkDAO;
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
    private final WorkDAO workDAO;
    private final GalleryDAO galleryDAO;

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

    public CommentResponseDTO update(Long commentId, String content) {
        Long memberId = resolveMemberId();
        CommentResponseDTO comment = getOwnedComment(commentId, memberId);
        String normalizedContent = content == null ? "" : content.trim();

        if (normalizedContent.isBlank()) {
            throw new IllegalArgumentException("comment content is empty");
        }

        commentDAO.updateContent(commentId, normalizedContent);

        CommentResponseDTO updatedComment = commentDAO.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("comment not found"));
        updatedComment.setIsLiked(commentDAO.existsLike(memberId, commentId));
        updatedComment.setIsOwner(true);
        return updatedComment;
    }

    public void delete(Long commentId) {
        Long memberId = resolveMemberId();
        CommentResponseDTO comment = getOwnedComment(commentId, memberId);

        commentDAO.delete(commentId);

        if (comment.getParentId() != null) {
            return;
        }

        if ("WORK".equals(comment.getTargetType())) {
            workDAO.decreaseCommentCount(comment.getTargetId());
            return;
        }

        if ("GALLERY".equals(comment.getTargetType())) {
            galleryDAO.decreaseCommentCount(comment.getTargetId());
        }
    }

    private CommentResponseDTO getOwnedComment(Long commentId, Long memberId) {
        CommentResponseDTO comment = commentDAO.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("comment not found"));

        if (!memberId.equals(comment.getMemberId())) {
            throw new IllegalStateException("forbidden");
        }

        return comment;
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
