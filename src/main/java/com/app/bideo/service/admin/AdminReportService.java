package com.app.bideo.service.admin;

import com.app.bideo.dto.admin.ReportResponseDTO;
import com.app.bideo.dto.admin.ReportSearchDTO;
import com.app.bideo.repository.admin.AdminReportDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class AdminReportService {

    private static final Set<String> VALID_REPORT_STATUSES = Set.of("PENDING", "REVIEWING", "RESOLVED", "CANCELLED");

    private final AdminReportDAO adminReportDAO;

    @Transactional(readOnly = true)
    public List<ReportResponseDTO> getReports(ReportSearchDTO searchDTO) {
        return adminReportDAO.findAll(searchDTO);
    }

    @Transactional(readOnly = true)
    public ReportResponseDTO getReportDetail(Long id) {
        return adminReportDAO.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("report not found"));
    }

    public void updateReportStatus(Long id, String status) {
        if (status == null || !VALID_REPORT_STATUSES.contains(status)) {
            throw new IllegalArgumentException("invalid report status: " + status);
        }
        adminReportDAO.updateStatus(id, status);
    }

    @Transactional(readOnly = true)
    public int getReportCount(ReportSearchDTO searchDTO) {
        return adminReportDAO.count(searchDTO);
    }
}
