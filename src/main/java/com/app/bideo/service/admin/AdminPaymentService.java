package com.app.bideo.service.admin;

import com.app.bideo.aop.annotation.LogStatusWithReturn;
import com.app.bideo.dto.admin.AdminPaymentDetailResponseDTO;
import com.app.bideo.dto.admin.AdminPaymentListResponseDTO;
import com.app.bideo.dto.admin.AdminSearchDTO;
import com.app.bideo.repository.admin.AdminPaymentDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class AdminPaymentService {

    private final AdminPaymentDAO adminPaymentDAO;

    @Transactional(readOnly = true)
    @Cacheable(value = "admin:payments:list",
            key = "(#searchDTO?.keyword?:'')+'|'+(#searchDTO?.status?:'')+'|'+(#searchDTO?.page?:1)+'|'+(#searchDTO?.size?:30)")
    @LogStatusWithReturn
    public List<AdminPaymentListResponseDTO> getPayments(AdminSearchDTO searchDTO) {
        return adminPaymentDAO.findAll(searchDTO);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "admin:payments:detail", key = "#id")
    @LogStatusWithReturn
    public AdminPaymentDetailResponseDTO getPaymentDetail(Long id) {
        return adminPaymentDAO.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("payment not found"));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "admin:payments:count",
            key = "(#searchDTO?.keyword?:'')+'|'+(#searchDTO?.status?:'')")
    @LogStatusWithReturn
    public int getPaymentCount(AdminSearchDTO searchDTO) {
        return adminPaymentDAO.count(searchDTO);
    }
}
