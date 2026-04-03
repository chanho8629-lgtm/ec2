package com.app.bideo.repository.admin;

import com.app.bideo.domain.admin.ReportVO;
import com.app.bideo.mapper.admin.ReportMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ReportRepository {

    private final ReportMapper reportMapper;

    public void save(ReportVO reportVO) {
        reportMapper.insertReport(reportVO);
    }
}
