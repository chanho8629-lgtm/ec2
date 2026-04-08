package com.app.bideo.repository.admin;

import com.app.bideo.dto.admin.AdminPaymentDetailResponseDTO;
import com.app.bideo.dto.admin.AdminPaymentListResponseDTO;
import com.app.bideo.dto.admin.AdminSearchDTO;
import com.app.bideo.mapper.admin.AdminPaymentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AdminPaymentDAO {

    private final AdminPaymentMapper adminPaymentMapper;

    public List<AdminPaymentListResponseDTO> findAll(AdminSearchDTO searchDTO) {
        return adminPaymentMapper.selectPaymentList(searchDTO);
    }

    public Optional<AdminPaymentDetailResponseDTO> findById(Long id) {
        return Optional.ofNullable(adminPaymentMapper.selectPaymentDetail(id));
    }

    public int count(AdminSearchDTO searchDTO) {
        return adminPaymentMapper.countPayments(searchDTO);
    }
}
