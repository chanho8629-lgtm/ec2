package com.app.bideo.repository.work;

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
import com.app.bideo.mapper.work.WorkMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class WorkDAO {

    private final WorkMapper workMapper;

    // 작품 기본 정보 저장
    public void save(WorkDTO workDTO) {
        workMapper.insertWork(workDTO);
    }

    // 작품 파일 저장
    public void saveFile(WorkFileVO workFileVO) {
        workMapper.insertWorkFile(workFileVO);
    }

    // 작품 태그 연결 저장
    public void saveTag(WorkTagVO workTagVO) {
        workMapper.insertWorkTag(workTagVO);
    }

    // 작품 단건 조회
    public Optional<WorkDTO> findById(Long id) {
        return Optional.ofNullable(workMapper.selectWork(id));
    }

    public void increaseViewCount(Long id) {
        workMapper.increaseWorkViewCount(id);
    }

    public Optional<Long> findFirstMemberId() {
        return Optional.ofNullable(workMapper.selectFirstMemberId());
    }

    // 화면 표시용 상세 조회
    public Optional<WorkDetailResponseDTO> findDetailById(Long id) {
        return Optional.ofNullable(workMapper.selectWorkDetail(id));
    }

    // 조건별 작품 목록 조회
    public List<WorkListResponseDTO> findAll(WorkSearchDTO searchDTO) {
        return workMapper.selectWorkList(searchDTO);
    }

    // 검색해서 목록 조회
    public List<WorkListResponseDTO> findBySearch(Criteria criteria, String keyword, String sort) {
        return workMapper.selectSearchWorkList(criteria, keyword, sort);
    }

    // 목록 페이징용 전체 개수 조회
    public int findTotal(WorkSearchDTO searchDTO) {
        return workMapper.selectWorkCount(searchDTO);
    }

    // 작품에 연결된 파일 목록 조회
    public List<WorkFileResponseDTO> findFilesByWorkId(Long workId) {
        return workMapper.selectWorkFilesByWorkId(workId);
    }

    // 작품에 연결된 태그 목록 조회
    public List<TagResponseDTO> findTagsByWorkId(Long workId) {
        return workMapper.selectWorkTagsByWorkId(workId);
    }

    // 태그명으로 태그 id 조회
    public Optional<Long> findTagIdByName(String tagName) {
        return Optional.ofNullable(workMapper.selectTagIdByName(tagName));
    }

    // 새 태그 저장
    public void saveTagName(String tagName) {
        workMapper.insertTag(tagName);
    }

    public List<TagResponseDTO> findTagSuggestions(String keyword, int limit) {
        return workMapper.selectTagSuggestions(keyword, limit);
    }

    // 작품 댓글 저장
    public void saveComment(CommentVO commentVO) {
        workMapper.insertWorkComment(commentVO);
    }

    // 작품 댓글 개수 증가
    public void increaseCommentCount(Long workId) {
        workMapper.increaseWorkCommentCount(workId);
    }

    public void decreaseCommentCount(Long workId) {
        workMapper.decreaseWorkCommentCount(workId);
    }

    // 작품 댓글 목록 조회
    public List<CommentResponseDTO> findCommentsByWorkId(Long workId) {
        return workMapper.selectWorkCommentsByWorkId(workId);
    }

    public boolean existsActiveAuctionByWorkId(Long workId) {
        return workMapper.existsActiveAuctionByWorkId(workId);
    }

    public boolean existsEndedLatestAuctionByWorkId(Long workId) {
        return workMapper.existsEndedLatestAuctionByWorkId(workId);
    }

    public boolean existsLike(Long memberId, Long workId) {
        return workMapper.existsWorkLike(memberId, workId);
    }

    public void saveLike(Long memberId, Long workId) {
        workMapper.insertWorkLike(memberId, workId);
    }

    public void deleteLike(Long memberId, Long workId) {
        workMapper.deleteWorkLike(memberId, workId);
    }

    public void increaseLikeCount(Long workId) {
        workMapper.increaseWorkLikeCount(workId);
    }

    public void decreaseLikeCount(Long workId) {
        workMapper.decreaseWorkLikeCount(workId);
    }

    public int findLikeCount(Long workId) {
        return Optional.ofNullable(workMapper.selectWorkLikeCount(workId)).orElse(0);
    }

    public void updateStatus(Long id, String status) {
        workMapper.updateWorkStatus(id, status);
    }

    // 작품 기본 정보 수정
    public void setWork(WorkDTO workDTO) {
        workMapper.updateWork(workDTO);
    }

    // 작품 파일 전체 삭제
    public void deleteFilesByWorkId(Long workId) {
        workMapper.deleteWorkFilesByWorkId(workId);
    }

    // 작품 태그 전체 삭제
    public void deleteTagsByWorkId(Long workId) {
        workMapper.deleteWorkTagsByWorkId(workId);
    }

    // 작품 soft delete 처리
    public void delete(Long id) {
        workMapper.softDeleteWork(id);
    }
}
