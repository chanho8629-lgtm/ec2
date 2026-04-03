package com.app.bideo.repository.admin;

import com.app.bideo.dto.admin.AdminRestrictionResponseDTO;
import com.app.bideo.dto.admin.AdminRestrictionSearchDTO;
import com.app.bideo.dto.admin.AdminRestrictionUpsertRequestDTO;
import com.app.bideo.mapper.admin.AdminRestrictionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AdminRestrictionDAO {

    private final AdminRestrictionMapper adminRestrictionMapper;

    public List<AdminRestrictionResponseDTO> findAll(AdminRestrictionSearchDTO searchDTO) {
        return adminRestrictionMapper.selectRestrictionList(searchDTO);
    }

    public Optional<AdminRestrictionResponseDTO> findById(Long id) {
        return Optional.ofNullable(adminRestrictionMapper.selectRestrictionDetail(id));
    }

    public Optional<AdminRestrictionResponseDTO> findActiveByMemberId(Long memberId) {
        return Optional.ofNullable(adminRestrictionMapper.selectActiveRestrictionByMemberId(memberId));
    }

    public List<AdminRestrictionResponseDTO> findExpirableRestrictions() {
        return adminRestrictionMapper.selectExpirableRestrictions();
    }

    public void insert(AdminRestrictionUpsertRequestDTO requestDTO) {
        if (adminRestrictionMapper.insertRestriction(requestDTO) == 0) {
            throw new IllegalStateException("restriction insert failed");
        }
    }

    public void update(Long id, AdminRestrictionUpsertRequestDTO requestDTO) {
        if (adminRestrictionMapper.updateRestriction(id, requestDTO) == 0) {
            throw new IllegalArgumentException("restriction not found");
        }
    }

    public void release(Long id) {
        if (adminRestrictionMapper.releaseRestriction(id) == 0) {
            throw new IllegalArgumentException("restriction not found");
        }
    }

    public void expireExpiredRestrictions() {
        adminRestrictionMapper.expireRestrictions();
    }
}
