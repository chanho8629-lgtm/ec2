package com.app.bideo.repository.gallery;

import com.app.bideo.common.pagination.Criteria;
import com.app.bideo.domain.interaction.CommentVO;
import com.app.bideo.dto.common.TagResponseDTO;
import com.app.bideo.dto.gallery.GalleryCreateRequestDTO;
import com.app.bideo.dto.gallery.GalleryDetailResponseDTO;
import com.app.bideo.dto.gallery.GalleryListResponseDTO;
import com.app.bideo.dto.gallery.GallerySearchDTO;
import com.app.bideo.dto.gallery.GalleryUpdateRequestDTO;
import com.app.bideo.dto.gallery.SearchGalleryCoverDataDTO;
import com.app.bideo.dto.gallery.SearchGallerySuggestionDTO;
import com.app.bideo.dto.interaction.CommentResponseDTO;
import com.app.bideo.mapper.gallery.GalleryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class GalleryDAO {

    private final GalleryMapper galleryMapper;

    public void save(GalleryCreateRequestDTO galleryCreateRequestDTO) {
        galleryMapper.insertGallery(galleryCreateRequestDTO);
    }

    public Optional<GalleryDetailResponseDTO> findById(Long id) {
        return Optional.ofNullable(galleryMapper.selectGalleryDetail(id));
    }

    public List<GalleryListResponseDTO> findAllByMemberId(Long memberId) {
        return galleryMapper.selectGalleryListByMemberId(memberId);
    }

    public Optional<Long> findMemberIdById(Long id) {
        return Optional.ofNullable(galleryMapper.selectGalleryMemberId(id));
    }

    public void increaseViewCount(Long galleryId) {
        if (galleryMapper.increaseGalleryViewCount(galleryId) == 0) {
            throw new IllegalArgumentException("gallery not found");
        }
    }

    public void update(Long id, GalleryUpdateRequestDTO galleryUpdateRequestDTO) {
        if (galleryMapper.updateGallery(id, galleryUpdateRequestDTO) == 0) {
            throw new IllegalArgumentException("gallery not found");
        }
    }

    public void delete(Long id) {
        if (galleryMapper.softDeleteGallery(id) == 0) {
            throw new IllegalArgumentException("gallery not found");
        }
    }

    public void saveWorkLink(Long galleryId, Long workId) {
        galleryMapper.insertGalleryWork(galleryId, workId);
    }

    public void saveTag(Long galleryId, Long tagId) {
        galleryMapper.insertGalleryTag(galleryId, tagId);
    }

    public void deleteWorkLinkByWorkId(Long workId) {
        galleryMapper.deleteGalleryWorkByWorkId(workId);
    }

    public void deleteWorkLinksByGalleryId(Long galleryId) {
        galleryMapper.deleteGalleryWorkByGalleryId(galleryId);
    }

    public void deleteTagsByGalleryId(Long galleryId) {
        galleryMapper.deleteGalleryTagByGalleryId(galleryId);
    }

    public Optional<Long> findGalleryIdByWorkId(Long workId) {
        return Optional.ofNullable(galleryMapper.selectGalleryIdByWorkId(workId));
    }

    public List<Long> findWorkIdsByGalleryId(Long galleryId) {
        return galleryMapper.selectWorkIdsByGalleryId(galleryId);
    }

    public void updateWorkCount(Long galleryId) {
        galleryMapper.refreshGalleryWorkCount(galleryId);
    }

    public void saveComment(CommentVO commentVO) {
        galleryMapper.insertGalleryComment(commentVO);
    }

    public void increaseCommentCount(Long galleryId) {
        galleryMapper.increaseGalleryCommentCount(galleryId);
    }

    public void decreaseCommentCount(Long galleryId) {
        if (galleryMapper.decreaseGalleryCommentCount(galleryId) == 0) {
            throw new IllegalArgumentException("gallery not found");
        }
    }

    public List<CommentResponseDTO> findCommentsByGalleryId(Long galleryId) {
        return galleryMapper.selectGalleryCommentsByGalleryId(galleryId);
    }

    public List<TagResponseDTO> findTagsByGalleryId(Long galleryId) {
        return galleryMapper.selectGalleryTagsByGalleryId(galleryId);
    }

    public Optional<Long> findTagIdByName(String tagName) {
        return Optional.ofNullable(galleryMapper.selectTagIdByName(tagName));
    }

    public void saveTagName(String tagName) {
        galleryMapper.insertTag(tagName);
    }

    public boolean existsLike(Long memberId, Long galleryId) {
        return galleryMapper.existsGalleryLike(memberId, galleryId);
    }

    public void saveLike(Long memberId, Long galleryId) {
        galleryMapper.insertGalleryLike(memberId, galleryId);
    }

    public void deleteLike(Long memberId, Long galleryId) {
        galleryMapper.deleteGalleryLike(memberId, galleryId);
    }

    public void increaseLikeCount(Long galleryId) {
        galleryMapper.increaseGalleryLikeCount(galleryId);
    }

    public void decreaseLikeCount(Long galleryId) {
        galleryMapper.decreaseGalleryLikeCount(galleryId);
    }

    public int findLikeCount(Long galleryId) {
        return Optional.ofNullable(galleryMapper.selectGalleryLikeCount(galleryId)).orElse(0);
    }

    public List<GalleryListResponseDTO> findAll(GallerySearchDTO searchDTO) {
        return galleryMapper.selectGalleryList(searchDTO);
    }

    // 검색해서 목록 조회
    public List<GalleryListResponseDTO> findBySearch(Criteria criteria, String keyword, String sort) {
        return galleryMapper.selectSearchGalleryList(criteria, keyword, sort);
    }

    public int findTotal(GallerySearchDTO searchDTO) {
        return galleryMapper.selectGalleryCount(searchDTO);
    }

    public List<GalleryListResponseDTO> findRecommended() {
        return galleryMapper.selectRecommendedGalleries();
    }

    public List<TagResponseDTO> findPopularTags(int limit) {
        return galleryMapper.selectPopularTags(limit);
    }

    public List<SearchGallerySuggestionDTO> findRecommendedSearchGalleries() {
        return galleryMapper.selectRecommendedSearchGalleries();
    }

    public Optional<SearchGalleryCoverDataDTO> findSearchGalleryCover(Long id) {
        return Optional.ofNullable(galleryMapper.selectSearchGalleryCover(id));
    }

}
