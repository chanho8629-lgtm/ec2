package com.app.bideo.mapper.gallery;

import com.app.bideo.domain.interaction.CommentVO;
import com.app.bideo.dto.common.TagResponseDTO;
import com.app.bideo.dto.gallery.GalleryCreateRequestDTO;
import com.app.bideo.dto.gallery.SearchGalleryCoverDataDTO;
import com.app.bideo.dto.gallery.SearchGallerySuggestionDTO;
import com.app.bideo.dto.gallery.GalleryDetailResponseDTO;
import com.app.bideo.dto.gallery.GalleryListResponseDTO;
import com.app.bideo.dto.gallery.GallerySearchDTO;
import com.app.bideo.dto.gallery.GalleryUpdateRequestDTO;
import com.app.bideo.dto.interaction.CommentResponseDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface GalleryMapper {

    void insertGallery(GalleryCreateRequestDTO galleryCreateRequestDTO);

    GalleryDetailResponseDTO selectGalleryDetail(@Param("id") Long id);

    List<GalleryListResponseDTO> selectGalleryListByMemberId(@Param("memberId") Long memberId);

    Long selectGalleryMemberId(@Param("id") Long id);

    int increaseGalleryViewCount(@Param("galleryId") Long galleryId);

    int updateGallery(@Param("id") Long id, @Param("gallery") GalleryUpdateRequestDTO galleryUpdateRequestDTO);

    int softDeleteGallery(@Param("id") Long id);

    void insertGalleryWork(@Param("galleryId") Long galleryId, @Param("workId") Long workId);

    void insertGalleryTag(@Param("galleryId") Long galleryId, @Param("tagId") Long tagId);

    int deleteGalleryWorkByWorkId(@Param("workId") Long workId);

    int deleteGalleryWorkByGalleryId(@Param("galleryId") Long galleryId);

    int deleteGalleryTagByGalleryId(@Param("galleryId") Long galleryId);

    Long selectGalleryIdByWorkId(@Param("workId") Long workId);

    List<Long> selectWorkIdsByGalleryId(@Param("galleryId") Long galleryId);

    void refreshGalleryWorkCount(@Param("galleryId") Long galleryId);

    void insertGalleryComment(CommentVO commentVO);

    int increaseGalleryCommentCount(@Param("galleryId") Long galleryId);

    int decreaseGalleryCommentCount(@Param("galleryId") Long galleryId);

    List<CommentResponseDTO> selectGalleryCommentsByGalleryId(@Param("galleryId") Long galleryId);

    List<TagResponseDTO> selectGalleryTagsByGalleryId(@Param("galleryId") Long galleryId);

    Long selectTagIdByName(@Param("tagName") String tagName);

    void insertTag(@Param("tagName") String tagName);

    boolean existsGalleryLike(@Param("memberId") Long memberId, @Param("galleryId") Long galleryId);

    void insertGalleryLike(@Param("memberId") Long memberId, @Param("galleryId") Long galleryId);

    int deleteGalleryLike(@Param("memberId") Long memberId, @Param("galleryId") Long galleryId);

    int increaseGalleryLikeCount(@Param("galleryId") Long galleryId);

    int decreaseGalleryLikeCount(@Param("galleryId") Long galleryId);

    Integer selectGalleryLikeCount(@Param("galleryId") Long galleryId);

    List<GalleryListResponseDTO> selectGalleryList(GallerySearchDTO searchDTO);

    int selectGalleryCount(GallerySearchDTO searchDTO);

    List<GalleryListResponseDTO> selectRecommendedGalleries();

    List<TagResponseDTO> selectPopularTags(@Param("limit") int limit);

    List<SearchGallerySuggestionDTO> selectRecommendedSearchGalleries();

    SearchGalleryCoverDataDTO selectSearchGalleryCover(@Param("id") Long id);

}
