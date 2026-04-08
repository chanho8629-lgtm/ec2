package com.app.bideo.service.admin;

import com.app.bideo.dto.admin.AdminSearchDTO;
import com.app.bideo.dto.admin.AdminWorkDetailResponseDTO;
import com.app.bideo.dto.admin.AdminWorkListResponseDTO;
import com.app.bideo.repository.admin.AdminWorkDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class AdminWorkService {

    private static final Set<String> VALID_WORK_STATUSES = Set.of("ACTIVE", "HIDDEN");

    private final AdminWorkDAO adminWorkDAO;

    @Transactional(readOnly = true)
    public List<AdminWorkListResponseDTO> getWorks(AdminSearchDTO searchDTO) {
        return adminWorkDAO.findAll(searchDTO);
    }

    @Transactional(readOnly = true)
    public AdminWorkDetailResponseDTO getWorkDetail(Long id) {
        return adminWorkDAO.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("work not found"));
    }

    public void updateWorkStatus(Long id, String status) {
        if (status == null || !VALID_WORK_STATUSES.contains(status)) {
            throw new IllegalArgumentException("invalid work status: " + status);
        }
        adminWorkDAO.updateStatus(id, status);
    }

    @Transactional(readOnly = true)
    public int getWorkCount(AdminSearchDTO searchDTO) {
        return adminWorkDAO.count(searchDTO);
    }
}
