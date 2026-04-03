package com.app.bideo.mapper.admin;

import com.app.bideo.domain.admin.ReportVO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ReportMapper {
    void insertReport(ReportVO reportVO);
}
