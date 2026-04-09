package com.app.bideo.service.search;

import com.app.bideo.common.pagination.Criteria;
import com.app.bideo.dto.gallery.GalleryListResponseDTO;
import com.app.bideo.dto.member.MemberListResponseDTO;
import com.app.bideo.dto.search.SearchResultResponseDTO;
import com.app.bideo.dto.work.WorkListResponseDTO;
import com.app.bideo.repository.gallery.GalleryDAO;
import com.app.bideo.repository.member.MemberRepository;
import com.app.bideo.repository.work.WorkDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SearchService {

    private final MemberRepository memberRepository;
    private final GalleryDAO galleryDAO;
    private final WorkDAO workDAO;

    public SearchResultResponseDTO search(int page, String keyword, String type, String sort, Long currentMemberId) {
        Criteria criteria = new Criteria();
        criteria.setPage(page);
        criteria.setRowCount(10);
        criteria.setCount(11);
        criteria.setOffset((page - 1) * 10);

        List<MemberListResponseDTO> profiles = List.of();
        List<GalleryListResponseDTO> galleries = List.of();
        List<WorkListResponseDTO> works = List.of();
        boolean anyHasMore = false;

        if ("all".equals(type) || "profile".equals(type)) {
            profiles = new ArrayList<>(memberRepository.searchByKeywordPaged(criteria, keyword, currentMemberId));
            if (profiles.size() > criteria.getRowCount()) {
                anyHasMore = true;
                profiles.remove(profiles.size() - 1);
            }
        }

        if ("all".equals(type) || "gallery".equals(type)) {
            galleries = new ArrayList<>(galleryDAO.findBySearch(criteria, keyword, sort));
            if (galleries.size() > criteria.getRowCount()) {
                anyHasMore = true;
                galleries.remove(galleries.size() - 1);
            }
        }

        if ("all".equals(type) || "work".equals(type)) {
            works = new ArrayList<>(workDAO.findBySearch(criteria, keyword, sort));
            if (works.size() > criteria.getRowCount()) {
                anyHasMore = true;
                works.remove(works.size() - 1);
            }
        }

        criteria.setHasMore(anyHasMore);

        return SearchResultResponseDTO.builder()
                .profiles(profiles)
                .galleries(galleries)
                .works(works)
                .criteria(criteria)
                .build();
    }
}
