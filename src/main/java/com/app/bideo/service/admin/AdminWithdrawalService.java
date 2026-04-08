package com.app.bideo.service.admin;

import com.app.bideo.dto.admin.AdminSearchDTO;
import com.app.bideo.dto.admin.AdminWithdrawalDetailResponseDTO;
import com.app.bideo.dto.admin.AdminWithdrawalListResponseDTO;
import com.app.bideo.repository.admin.AdminWithdrawalDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class AdminWithdrawalService {

    private final AdminWithdrawalDAO adminWithdrawalDAO;

    @Transactional(readOnly = true)
    public List<AdminWithdrawalListResponseDTO> getWithdrawals(AdminSearchDTO searchDTO) {
        return adminWithdrawalDAO.findAll(searchDTO);
    }

    @Transactional(readOnly = true)
    public AdminWithdrawalDetailResponseDTO getWithdrawalDetail(Long id) {
        return adminWithdrawalDAO.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("withdrawal not found"));
    }

    public void approveWithdrawal(Long id, Long adminId) {
        adminWithdrawalDAO.approve(id, adminId);
    }

    public void rejectWithdrawal(Long id, String reason, Long adminId) {
        adminWithdrawalDAO.reject(id, reason, adminId);
    }

    @Transactional(readOnly = true)
    public int getWithdrawalCount(AdminSearchDTO searchDTO) {
        return adminWithdrawalDAO.count(searchDTO);
    }
}
