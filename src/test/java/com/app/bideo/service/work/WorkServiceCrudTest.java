package com.app.bideo.service.work;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.common.enumeration.MemberStatus;
import com.app.bideo.domain.member.MemberVO;
import com.app.bideo.dto.work.WorkCreateRequestDTO;
import com.app.bideo.dto.work.WorkDTO;
import com.app.bideo.dto.work.WorkUpdateRequestDTO;
import com.app.bideo.repository.auction.AuctionDAO;
import com.app.bideo.repository.gallery.GalleryDAO;
import com.app.bideo.repository.interaction.BookmarkDAO;
import com.app.bideo.repository.work.WorkDAO;
import com.app.bideo.service.common.S3FileService;
import com.app.bideo.service.interaction.CommentService;
import com.app.bideo.service.notification.NotificationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkServiceCrudTest {

    @Mock WorkDAO workDAO;
    @Mock AuctionDAO auctionDAO;
    @Mock GalleryDAO galleryDAO;
    @Mock BookmarkDAO bookmarkDAO;
    @Mock CommentService commentService;
    @Mock NotificationService notificationService;
    @Mock S3FileService s3FileService;
    @InjectMocks WorkService workService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createRequiresMediaOrExistingFile() {
        when(galleryDAO.findMemberIdById(10L)).thenReturn(Optional.of(3L));
        WorkCreateRequestDTO request = WorkCreateRequestDTO.builder()
                .galleryId(10L)
                .title("작품")
                .build();

        assertThatThrownBy(() -> workService.write(3L, request, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("업로드할 파일을 선택해주세요.");

        verify(workDAO, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void nonOwnerCannotUpdateWork() {
        when(workDAO.findById(20L)).thenReturn(Optional.of(
                WorkDTO.builder().id(20L).memberId(3L).build()
        ));

        assertThatThrownBy(() -> workService.update(
                20L,
                99L,
                WorkUpdateRequestDTO.builder().galleryId(10L).title("변경").build()
        )).isInstanceOf(IllegalStateException.class)
                .hasMessage("forbidden");

        verify(workDAO, never()).setWork(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void ownerDeleteCleansFilesTagsAndGalleryLink() {
        authenticate(3L);
        when(workDAO.findById(20L)).thenReturn(Optional.of(
                WorkDTO.builder().id(20L).memberId(3L).build()
        ));
        when(galleryDAO.findGalleryIdByWorkId(20L)).thenReturn(Optional.of(10L));

        workService.delete(20L);

        verify(workDAO).deleteFilesByWorkId(20L);
        verify(workDAO).deleteTagsByWorkId(20L);
        verify(galleryDAO).deleteWorkLinkByWorkId(20L);
        verify(workDAO).delete(20L);
        verify(galleryDAO).updateWorkCount(10L);
    }

    private void authenticate(Long memberId) {
        CustomUserDetails principal = new CustomUserDetails(MemberVO.builder()
                .id(memberId)
                .email("portfolio@example.com")
                .password("unused")
                .nickname("portfolio")
                .status(MemberStatus.ACTIVE)
                .build());
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );
    }
}
