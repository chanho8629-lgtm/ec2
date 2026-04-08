package com.app.bideo.service.search;

import com.app.bideo.dto.gallery.GalleryListResponseDTO;
import com.app.bideo.dto.gallery.GallerySearchDTO;
import com.app.bideo.dto.member.MemberListResponseDTO;
import com.app.bideo.dto.search.SearchResultResponseDTO;
import com.app.bideo.dto.work.WorkListResponseDTO;
import com.app.bideo.dto.work.WorkSearchDTO;
import com.app.bideo.repository.member.MemberRepository;
import com.app.bideo.service.gallery.GalleryService;
import com.app.bideo.service.work.WorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SearchService {

    private final MemberRepository memberRepository;
    private final GalleryService galleryService;
    private final WorkService workService;

    public SearchResultResponseDTO search(String keyword, Long currentMemberId) {
        List<MemberListResponseDTO> profiles =
                memberRepository.searchByKeyword(keyword, currentMemberId, 20);

        GallerySearchDTO gallerySearch = new GallerySearchDTO();
        gallerySearch.setKeyword(keyword);
        gallerySearch.setPage(1);
        gallerySearch.setSize(20);
        List<GalleryListResponseDTO> galleries =
                galleryService.getGalleryList(gallerySearch).getContent();

        WorkSearchDTO workSearch = new WorkSearchDTO();
        workSearch.setKeyword(keyword);
        workSearch.setPage(1);
        workSearch.setSize(20);
        List<WorkListResponseDTO> works =
                workService.getWorkList(workSearch).getContent();

        return SearchResultResponseDTO.builder()
                .profiles(profiles)
                .galleries(galleries)
                .works(works)
                .build();
    }
}
