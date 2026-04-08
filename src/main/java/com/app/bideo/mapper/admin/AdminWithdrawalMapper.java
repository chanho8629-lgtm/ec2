package com.app.bideo.mapper.admin;

import com.app.bideo.dto.admin.AdminSearchDTO;
import com.app.bideo.dto.admin.AdminWithdrawalDetailResponseDTO;
import com.app.bideo.dto.admin.AdminWithdrawalListResponseDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminWithdrawalMapper {

    List<AdminWithdrawalListResponseDTO> selectWithdrawalList(AdminSearchDTO searchDTO);

    AdminWithdrawalDetailResponseDTO selectWithdrawalDetail(@Param("id") Long id);

    int updateWithdrawalApprove(@Param("id") Long id, @Param("adminId") Long adminId);

    int updateWithdrawalReject(@Param("id") Long id, @Param("reason") String reason, @Param("adminId") Long adminId);

    int countWithdrawals(AdminSearchDTO searchDTO);
}
