package com.app.bideo.controller.gallery;

import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.dto.gallery.GalleryCreateRequestDTO;
import com.app.bideo.dto.gallery.GalleryCreateResponseDTO;
import com.app.bideo.dto.gallery.GalleryDetailResponseDTO;
import com.app.bideo.dto.gallery.GalleryListResponseDTO;
import com.app.bideo.dto.gallery.GallerySearchDTO;
import com.app.bideo.dto.gallery.GalleryUpdateRequestDTO;
import com.app.bideo.dto.common.LikeToggleResponseDTO;
import com.app.bideo.dto.interaction.CommentCreateRequestDTO;
import com.app.bideo.dto.interaction.CommentResponseDTO;
import com.app.bideo.service.gallery.GalleryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/galleries")
@RequiredArgsConstructor
public class GalleryAPIController {

    private final GalleryService galleryService;

    @GetMapping
    public PageResponseDTO<GalleryListResponseDTO> list(@ModelAttribute GallerySearchDTO searchDTO) {
        return galleryService.getGalleryList(searchDTO);
    }

    @GetMapping("/{id}")
    public GalleryDetailResponseDTO detail(@PathVariable Long id) {
        return galleryService.getGalleryDetail(id);
    }

    @PostMapping
    public ResponseEntity<GalleryCreateResponseDTO> write(
            @RequestParam(required = false) Long memberId,
            @ModelAttribute GalleryCreateRequestDTO requestDTO,
            @RequestParam("coverFile") MultipartFile coverFile
    ) {
        return ResponseEntity.ok(galleryService.write(memberId, requestDTO, coverFile));
    }

    @PostMapping("/{id}/edit")
    public ResponseEntity<Void> update(
            @PathVariable Long id,
            @RequestParam(required = false) Long memberId,
            @ModelAttribute GalleryUpdateRequestDTO requestDTO,
            @RequestParam(required = false) MultipartFile coverFile
    ) {
        galleryService.update(id, memberId, requestDTO, coverFile);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestParam(required = false) Long memberId
    ) {
        galleryService.delete(id, memberId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/comments")
    public List<CommentResponseDTO> comments(@PathVariable Long id) {
        return galleryService.getComments(id);
    }

    @PostMapping("/{id}/comments")
    public List<CommentResponseDTO> writeComment(
            @PathVariable Long id,
            @RequestParam(required = false) Long memberId,
            @RequestBody CommentCreateRequestDTO requestDTO
    ) {
        return galleryService.writeComment(id, memberId, requestDTO.getContent());
    }

    @PostMapping("/{id}/likes")
    public LikeToggleResponseDTO toggleLike(
            @PathVariable Long id,
            @RequestParam(required = false) Long memberId
    ) {
        return galleryService.toggleLike(id, memberId);
    }
}
