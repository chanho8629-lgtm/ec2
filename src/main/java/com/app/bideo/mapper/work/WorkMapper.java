package com.app.bideo.mapper.work;

import com.app.bideo.common.pagination.Criteria;
import com.app.bideo.domain.interaction.CommentVO;
import com.app.bideo.domain.work.WorkFileVO;
import com.app.bideo.domain.work.WorkTagVO;
import com.app.bideo.dto.common.TagResponseDTO;
import com.app.bideo.dto.interaction.CommentResponseDTO;
import com.app.bideo.dto.work.WorkDTO;
import com.app.bideo.dto.work.WorkDetailResponseDTO;
import com.app.bideo.dto.work.WorkFileResponseDTO;
import com.app.bideo.dto.work.WorkListResponseDTO;
import com.app.bideo.dto.work.WorkSearchDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Map;
import java.util.List;

@Mapper
public interface WorkMapper {

    void insertTestMember(Map<String, Object> params);

    Long selectMemberIdByEmail(@Param("email") String email);

    Long selectFirstMemberId();

    void insertWork(WorkDTO workDTO);

    int updateWork(WorkDTO workDTO);

    int softDeleteWork(@Param("id") Long id);

    WorkDTO selectWork(@Param("id") Long id);

    int increaseWorkViewCount(@Param("id") Long id);

    WorkDetailResponseDTO selectWorkDetail(@Param("id") Long id);

    List<WorkListResponseDTO> selectWorkList(WorkSearchDTO searchDTO);

    List<WorkListResponseDTO> selectSearchWorkList(@Param("criteria") Criteria criteria,
                                                    @Param("keyword") String keyword,
                                                    @Param("sort") String sort);

    int selectWorkCount(WorkSearchDTO searchDTO);

    void insertWorkFile(WorkFileVO workFileVO);

    int deleteWorkFilesByWorkId(@Param("workId") Long workId);

    List<WorkFileResponseDTO> selectWorkFilesByWorkId(@Param("workId") Long workId);

    void insertWorkTag(WorkTagVO workTagVO);

    int deleteWorkTagsByWorkId(@Param("workId") Long workId);

    List<Long> selectTagIdsByWorkId(@Param("workId") Long workId);

    Long selectTagIdByName(@Param("tagName") String tagName);

    void insertTag(@Param("tagName") String tagName);

    List<TagResponseDTO> selectTagSuggestions(@Param("keyword") String keyword, @Param("limit") int limit);

    List<TagResponseDTO> selectWorkTagsByWorkId(@Param("workId") Long workId);

    void insertWorkComment(CommentVO commentVO);

    int increaseWorkCommentCount(@Param("workId") Long workId);

    int decreaseWorkCommentCount(@Param("workId") Long workId);

    List<CommentResponseDTO> selectWorkCommentsByWorkId(@Param("workId") Long workId);

    boolean existsActiveAuctionByWorkId(@Param("workId") Long workId);

    boolean existsEndedLatestAuctionByWorkId(@Param("workId") Long workId);

    boolean existsWorkLike(@Param("memberId") Long memberId, @Param("workId") Long workId);

    void insertWorkLike(@Param("memberId") Long memberId, @Param("workId") Long workId);

    int deleteWorkLike(@Param("memberId") Long memberId, @Param("workId") Long workId);

    int increaseWorkLikeCount(@Param("workId") Long workId);

    int decreaseWorkLikeCount(@Param("workId") Long workId);

    Integer selectWorkLikeCount(@Param("workId") Long workId);
}
