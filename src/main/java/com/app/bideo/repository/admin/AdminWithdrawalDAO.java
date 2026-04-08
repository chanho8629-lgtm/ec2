package com.app.bideo.repository.admin;

import com.app.bideo.dto.admin.AdminSearchDTO;
import com.app.bideo.dto.admin.AdminWithdrawalDetailResponseDTO;
import com.app.bideo.dto.admin.AdminWithdrawalListResponseDTO;
import com.app.bideo.mapper.admin.AdminWithdrawalMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AdminWithdrawalDAO {

    private final AdminWithdrawalMapper adminWithdrawalMapper;

    public List<AdminWithdrawalListResponseDTO> findAll(AdminSearchDTO searchDTO) {
        return adminWithdrawalMapper.selectWithdrawalList(searchDTO);
    }

    public Optional<AdminWithdrawalDetailResponseDTO> findById(Long id) {
        return Optional.ofNullable(adminWithdrawalMapper.selectWithdrawalDetail(id));
    }

    public void approve(Long id, Long adminId) {
        if (adminWithdrawalMapper.updateWithdrawalApprove(id, adminId) == 0) {
            AdminWithdrawalDetailResponseDTO existing = adminWithdrawalMapper.selectWithdrawalDetail(id);
            if (existing == null) {
                throw new IllegalArgumentException("withdrawal not found");
            }
            throw new IllegalStateException("이미 처리된 출금 요청입니다. 현재 상태: " + existing.getStatus());
        }
    }

    public void reject(Long id, String reason, Long adminId) {
        if (adminWithdrawalMapper.updateWithdrawalReject(id, reason, adminId) == 0) {
            AdminWithdrawalDetailResponseDTO existing = adminWithdrawalMapper.selectWithdrawalDetail(id);
            if (existing == null) {
                throw new IllegalArgumentException("withdrawal not found");
            }
            throw new IllegalStateException("이미 처리된 출금 요청입니다. 현재 상태: " + existing.getStatus());
        }
    }

    public int count(AdminSearchDTO searchDTO) {
        return adminWithdrawalMapper.countWithdrawals(searchDTO);
    }
}
