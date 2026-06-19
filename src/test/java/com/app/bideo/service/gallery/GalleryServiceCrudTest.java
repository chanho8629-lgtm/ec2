package com.app.bideo.service.gallery;

import com.app.bideo.dto.gallery.GalleryUpdateRequestDTO;
import com.app.bideo.repository.gallery.GalleryDAO;
import com.app.bideo.repository.interaction.BookmarkDAO;
import com.app.bideo.repository.member.MemberRepository;
import com.app.bideo.repository.work.WorkDAO;
import com.app.bideo.service.common.S3FileService;
import com.app.bideo.service.interaction.CommentService;
import com.app.bideo.service.member.FollowService;
import com.app.bideo.service.notification.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GalleryServiceCrudTest {

    @Mock GalleryDAO galleryDAO;
    @Mock WorkDAO workDAO;
    @Mock BookmarkDAO bookmarkDAO;
    @Mock MemberRepository memberRepository;
    @Mock CommentService commentService;
    @Mock FollowService followService;
    @Mock NotificationService notificationService;
    @Mock S3FileService s3FileService;
    @InjectMocks GalleryService galleryService;

    @Test
    void ownerCanUpdateGalleryAndRebuildRelations() {
        when(galleryDAO.findMemberIdById(10L)).thenReturn(Optional.of(3L));
        GalleryUpdateRequestDTO request = GalleryUpdateRequestDTO.builder()
                .title("  새로운 예술관  ")
                .description("  설명  ")
                .workIds(List.of())
                .tagIds(List.of())
                .tagNames(List.of())
                .build();

        galleryService.update(10L, 3L, request, null);

        verify(galleryDAO).update(10L, request);
        verify(galleryDAO).deleteWorkLinksByGalleryId(10L);
        verify(galleryDAO).deleteTagsByGalleryId(10L);
        verify(galleryDAO).updateWorkCount(10L);
    }

    @Test
    void ownerDeletingGalleryCleansLinkedWorks() {
        when(galleryDAO.findMemberIdById(10L)).thenReturn(Optional.of(3L));
        when(galleryDAO.findWorkIdsByGalleryId(10L)).thenReturn(List.of(21L, 22L));

        galleryService.delete(10L, 3L);

        verify(workDAO).deleteFilesByWorkId(21L);
        verify(workDAO).deleteTagsByWorkId(21L);
        verify(workDAO).delete(21L);
        verify(workDAO).deleteFilesByWorkId(22L);
        verify(workDAO).deleteTagsByWorkId(22L);
        verify(workDAO).delete(22L);
        verify(galleryDAO).delete(10L);
    }

    @Test
    void nonOwnerCannotUpdateGallery() {
        when(galleryDAO.findMemberIdById(10L)).thenReturn(Optional.of(3L));

        assertThatThrownBy(() -> galleryService.update(
                10L,
                99L,
                GalleryUpdateRequestDTO.builder().title("변경").build(),
                null
        )).isInstanceOf(IllegalStateException.class)
                .hasMessage("forbidden");

        verify(galleryDAO, never()).update(org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.any());
    }
}
