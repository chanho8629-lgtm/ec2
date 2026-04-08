package com.app.bideo.mapper.admin;

import com.app.bideo.dto.admin.AdminSearchDTO;
import com.app.bideo.dto.admin.AdminWorkDetailResponseDTO;
import com.app.bideo.dto.admin.AdminWorkListResponseDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminWorkMapper {

    List<AdminWorkListResponseDTO> selectWorkList(AdminSearchDTO searchDTO);

    AdminWorkDetailResponseDTO selectWorkDetail(@Param("id") Long id);

    int updateWorkStatus(@Param("id") Long id, @Param("status") String status);

    int countWorks(AdminSearchDTO searchDTO);
}
