package com.app.bideo.service.admin;

import com.app.bideo.aop.annotation.LogStatus;
import com.app.bideo.aop.annotation.LogStatusWithReturn;
import com.app.bideo.dto.admin.ReportResponseDTO;
import com.app.bideo.dto.admin.ReportSearchDTO;
import com.app.bideo.repository.admin.AdminReportDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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
    @Cacheable(value = "admin:reports:list",
            key = "(#searchDTO?.keyword?:'')+'|'+(#searchDTO?.status?:'')+'|'+(#searchDTO?.targetType?:'')+'|'+(#searchDTO?.reporterId?:'')+'|'+(#searchDTO?.page?:1)+'|'+(#searchDTO?.size?:30)")
    @LogStatusWithReturn
    public List<ReportResponseDTO> getReports(ReportSearchDTO searchDTO) {
        return adminReportDAO.findAll(searchDTO);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "admin:reports:detail", key = "#id")
    @LogStatusWithReturn
    public ReportResponseDTO getReportDetail(Long id) {
        return adminReportDAO.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("report not found"));
    }

    @CacheEvict(value = {"admin:reports:list", "admin:reports:detail", "admin:reports:count"}, allEntries = true)
    @LogStatus
    public void updateReportStatus(Long id, String status, String memo) {
        if (status == null || !VALID_REPORT_STATUSES.contains(status)) {
            throw new IllegalArgumentException("invalid report status: " + status);
        }
        adminReportDAO.updateStatus(id, status, memo);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "admin:reports:count",
            key = "(#searchDTO?.keyword?:'')+'|'+(#searchDTO?.status?:'')+'|'+(#searchDTO?.targetType?:'')+'|'+(#searchDTO?.reporterId?:'')")
    @LogStatusWithReturn
    public int getReportCount(ReportSearchDTO searchDTO) {
        return adminReportDAO.count(searchDTO);
    }
}
