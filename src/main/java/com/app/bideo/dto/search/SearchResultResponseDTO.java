package com.app.bideo.dto.search;

import com.app.bideo.dto.gallery.GalleryListResponseDTO;
import com.app.bideo.dto.member.MemberListResponseDTO;
import com.app.bideo.dto.work.WorkListResponseDTO;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResultResponseDTO {
    private List<MemberListResponseDTO> profiles;
    private List<GalleryListResponseDTO> galleries;
    private List<WorkListResponseDTO> works;
}
