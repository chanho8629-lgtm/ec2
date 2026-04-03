package com.app.bideo.mapper.interaction;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CommentMapper {

    Long selectCommentId(@Param("commentId") Long commentId);

    boolean existsCommentLike(@Param("memberId") Long memberId, @Param("commentId") Long commentId);

    void insertCommentLike(@Param("memberId") Long memberId, @Param("commentId") Long commentId);

    int deleteCommentLike(@Param("memberId") Long memberId, @Param("commentId") Long commentId);

    int increaseCommentLikeCount(@Param("commentId") Long commentId);

    int decreaseCommentLikeCount(@Param("commentId") Long commentId);

    Integer selectCommentLikeCount(@Param("commentId") Long commentId);
}
