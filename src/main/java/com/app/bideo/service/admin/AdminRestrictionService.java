package com.app.bideo.service.admin;

import com.app.bideo.aop.annotation.LogStatus;
import com.app.bideo.aop.annotation.LogStatusWithReturn;
import com.app.bideo.dto.admin.AdminRestrictionResponseDTO;
import com.app.bideo.dto.admin.AdminRestrictionSearchDTO;
import com.app.bideo.dto.admin.AdminRestrictionUpsertRequestDTO;
import com.app.bideo.repository.admin.AdminMemberDAO;
import com.app.bideo.repository.admin.AdminRestrictionDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class AdminRestrictionService {

    private static final Set<String> VALID_RESTRICTION_TYPES = Set.of("BLOCK", "LIMIT");
    private static final Set<String> VALID_MEMBER_STATUSES = Set.of("ACTIVE", "SUSPENDED", "BANNED");

    private final AdminRestrictionDAO adminRestrictionDAO;
    private final AdminMemberDAO adminMemberDAO;

    @LogStatusWithReturn
    public List<AdminRestrictionResponseDTO> getRestrictions(AdminRestrictionSearchDTO searchDTO) {
        syncExpiredRestrictions();
        if (searchDTO != null && (searchDTO.getStatus() == null || searchDTO.getStatus().isBlank())) {
            searchDTO.setStatus("ACTIVE");
        }
        return adminRestrictionDAO.findAll(searchDTO);
    }

    @LogStatusWithReturn
    public AdminRestrictionResponseDTO getRestriction(Long id) {
        syncExpiredRestrictions();
        return getRestrictionOrThrow(id);
    }

    @Transactional(readOnly = true)
    @LogStatusWithReturn
    public Optional<AdminRestrictionResponseDTO> getActiveRestrictionByMemberId(Long memberId) {
        syncExpiredRestrictions();
        return adminRestrictionDAO.findActiveByMemberId(memberId);
    }

    @Caching(evict = {
            @CacheEvict(value = "admin:members:detail", allEntries = true),
            @CacheEvict(value = "admin:members:list", allEntries = true),
            @CacheEvict(value = "admin:members:count", allEntries = true)
    })
    @LogStatusWithReturn
    public Long createRestriction(AdminRestrictionUpsertRequestDTO requestDTO) {
        syncExpiredRestrictions();
        validateRequest(requestDTO);
        requestDTO.setPreviousMemberStatus(getCurrentMemberStatus(requestDTO.getMemberId()));

        adminRestrictionDAO.findActiveByMemberId(requestDTO.getMemberId()).ifPresent(existing -> {
            throw new IllegalArgumentException("이미 정지된 회원입니다. 먼저 정지 해제 후 다시 시도하세요.");
        });

        adminRestrictionDAO.insert(requestDTO);
        adminMemberDAO.updateStatus(requestDTO.getMemberId(), toMemberStatus(requestDTO.getRestrictionType()));
        return requestDTO.getId();
    }

    @Caching(evict = {
            @CacheEvict(value = "admin:members:detail", allEntries = true),
            @CacheEvict(value = "admin:members:list", allEntries = true),
            @CacheEvict(value = "admin:members:count", allEntries = true)
    })
    @LogStatus
    public void updateRestriction(Long id, AdminRestrictionUpsertRequestDTO requestDTO) {
        syncExpiredRestrictions();
        AdminRestrictionResponseDTO existing = getRestrictionOrThrow(id);
        ensureActive(existing);
        requestDTO.setMemberId(existing.getMemberId());
        requestDTO.setRestrictionType(existing.getRestrictionType());
        requestDTO.setPreviousMemberStatus(existing.getPreviousMemberStatus());
        validateRequest(requestDTO);
        adminRestrictionDAO.update(id, requestDTO);
        adminMemberDAO.updateStatus(existing.getMemberId(), toMemberStatus(existing.getRestrictionType()));
    }

    @Caching(evict = {
            @CacheEvict(value = "admin:members:detail", allEntries = true),
            @CacheEvict(value = "admin:members:list", allEntries = true),
            @CacheEvict(value = "admin:members:count", allEntries = true)
    })
    @LogStatus
    public void releaseRestriction(Long id) {
        syncExpiredRestrictions();
        AdminRestrictionResponseDTO existing = getRestrictionOrThrow(id);
        ensureActive(existing);
        adminRestrictionDAO.release(id);
        restoreMemberStatus(existing);
    }

    private void validateRequest(AdminRestrictionUpsertRequestDTO requestDTO) {
        if (requestDTO == null || requestDTO.getMemberId() == null) {
            throw new IllegalArgumentException("회원 정보가 필요합니다.");
        }
        if (requestDTO.getRestrictionType() == null || !VALID_RESTRICTION_TYPES.contains(requestDTO.getRestrictionType())) {
            throw new IllegalArgumentException("정지 유형이 올바르지 않습니다.");
        }
        if (requestDTO.getReason() == null || requestDTO.getReason().isBlank()) {
            throw new IllegalArgumentException("정지 사유를 입력하세요.");
        }
        if ("LIMIT".equals(requestDTO.getRestrictionType()) && requestDTO.getEndDatetime() == null) {
            throw new IllegalArgumentException("기간 제한 정지는 종료 일시가 필요합니다.");
        }
        if ("BLOCK".equals(requestDTO.getRestrictionType())) {
            requestDTO.setEndDatetime(null);
        }
    }

    private String toMemberStatus(String restrictionType) {
        return "BLOCK".equals(restrictionType) ? "BANNED" : "SUSPENDED";
    }

    private void syncExpiredRestrictions() {
        List<AdminRestrictionResponseDTO> expirableRestrictions = adminRestrictionDAO.findExpirableRestrictions();
        if (expirableRestrictions.isEmpty()) {
            return;
        }

        adminRestrictionDAO.expireExpiredRestrictions();
        expirableRestrictions.forEach(this::restoreMemberStatus);
    }

    private void restoreMemberStatus(AdminRestrictionResponseDTO restriction) {
        adminMemberDAO.updateStatus(restriction.getMemberId(), normalizeMemberStatus(restriction.getPreviousMemberStatus()));
    }

    private String getCurrentMemberStatus(Long memberId) {
        return normalizeMemberStatus(adminMemberDAO.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("member not found"))
                .getStatus());
    }

    private String normalizeMemberStatus(String status) {
        return VALID_MEMBER_STATUSES.contains(status) ? status : "ACTIVE";
    }

    private AdminRestrictionResponseDTO getRestrictionOrThrow(Long id) {
        return adminRestrictionDAO.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("restriction not found"));
    }

    private void ensureActive(AdminRestrictionResponseDTO restriction) {
        if (!"ACTIVE".equals(restriction.getStatus())) {
            throw new IllegalArgumentException("restriction is not active");
        }
    }
}
