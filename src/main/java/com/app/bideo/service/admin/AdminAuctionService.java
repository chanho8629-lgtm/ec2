package com.app.bideo.service.admin;

import com.app.bideo.dto.admin.AdminAuctionDetailResponseDTO;
import com.app.bideo.dto.admin.AdminAuctionListResponseDTO;
import com.app.bideo.dto.admin.AdminSearchDTO;
import com.app.bideo.repository.admin.AdminAuctionDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class AdminAuctionService {

    private final AdminAuctionDAO adminAuctionDAO;

    @Transactional(readOnly = true)
    @Cacheable(value = "admin:auctions:list",
            key = "(#searchDTO?.keyword?:'')+'|'+(#searchDTO?.status?:'')+'|'+(#searchDTO?.page?:1)+'|'+(#searchDTO?.size?:30)")
    public List<AdminAuctionListResponseDTO> getAuctions(AdminSearchDTO searchDTO) {
        return adminAuctionDAO.findAll(searchDTO);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "admin:auctions:detail", key = "#id")
    public AdminAuctionDetailResponseDTO getAuctionDetail(Long id) {
        return adminAuctionDAO.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("auction not found"));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "admin:auctions:count",
            key = "(#searchDTO?.keyword?:'')+'|'+(#searchDTO?.status?:'')")
    public int getAuctionCount(AdminSearchDTO searchDTO) {
        return adminAuctionDAO.count(searchDTO);
    }
}
