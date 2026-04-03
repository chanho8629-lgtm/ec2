package com.app.bideo.repository.admin;

import com.app.bideo.dto.admin.ReportResponseDTO;
import com.app.bideo.dto.admin.ReportSearchDTO;
import com.app.bideo.mapper.admin.AdminReportMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AdminReportDAO {

    private final AdminReportMapper adminReportMapper;

    public List<ReportResponseDTO> findAll(ReportSearchDTO searchDTO) {
        return adminReportMapper.selectReportList(searchDTO);
    }

    public Optional<ReportResponseDTO> findById(Long id) {
        return Optional.ofNullable(adminReportMapper.selectReportDetail(id));
    }

    public void updateStatus(Long id, String status) {
        if (adminReportMapper.updateReportStatus(id, status) == 0) {
            throw new IllegalArgumentException("report not found");
        }
    }

    public int count(ReportSearchDTO searchDTO) {
        return adminReportMapper.countReports(searchDTO);
    }
}
