package com.app.bideo.mapper.admin;

import com.app.bideo.dto.admin.ReportResponseDTO;
import com.app.bideo.dto.admin.ReportSearchDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminReportMapper {

    List<ReportResponseDTO> selectReportList(ReportSearchDTO searchDTO);

    ReportResponseDTO selectReportDetail(@Param("id") Long id);

    int updateReportStatus(@Param("id") Long id, @Param("status") String status, @Param("memo") String memo);

    int countReports(ReportSearchDTO searchDTO);
}
