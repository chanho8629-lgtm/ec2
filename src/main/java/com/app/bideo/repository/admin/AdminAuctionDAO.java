package com.app.bideo.repository.admin;

import com.app.bideo.dto.admin.AdminAuctionDetailResponseDTO;
import com.app.bideo.dto.admin.AdminAuctionListResponseDTO;
import com.app.bideo.dto.admin.AdminSearchDTO;
import com.app.bideo.mapper.admin.AdminAuctionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AdminAuctionDAO {

    private final AdminAuctionMapper adminAuctionMapper;

    public List<AdminAuctionListResponseDTO> findAll(AdminSearchDTO searchDTO) {
        return adminAuctionMapper.selectAuctionList(searchDTO);
    }

    public Optional<AdminAuctionDetailResponseDTO> findById(Long id) {
        return Optional.ofNullable(adminAuctionMapper.selectAuctionDetail(id));
    }

    public int count(AdminSearchDTO searchDTO) {
        return adminAuctionMapper.countAuctions(searchDTO);
    }
}
