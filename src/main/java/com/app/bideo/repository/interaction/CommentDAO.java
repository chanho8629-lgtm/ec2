package com.app.bideo.repository.interaction;

import com.app.bideo.mapper.interaction.CommentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CommentDAO {

    private final CommentMapper commentMapper;

    public Optional<Long> findId(Long commentId) {
        return Optional.ofNullable(commentMapper.selectCommentId(commentId));
    }

    public boolean existsLike(Long memberId, Long commentId) {
        return commentMapper.existsCommentLike(memberId, commentId);
    }

    public void saveLike(Long memberId, Long commentId) {
        commentMapper.insertCommentLike(memberId, commentId);
    }

    public void deleteLike(Long memberId, Long commentId) {
        commentMapper.deleteCommentLike(memberId, commentId);
    }

    public void increaseLikeCount(Long commentId) {
        commentMapper.increaseCommentLikeCount(commentId);
    }

    public void decreaseLikeCount(Long commentId) {
        commentMapper.decreaseCommentLikeCount(commentId);
    }

    public int findLikeCount(Long commentId) {
        return Optional.ofNullable(commentMapper.selectCommentLikeCount(commentId)).orElse(0);
    }
}
