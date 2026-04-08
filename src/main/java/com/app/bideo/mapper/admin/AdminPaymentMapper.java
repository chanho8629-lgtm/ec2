package com.app.bideo.mapper.admin;

import com.app.bideo.dto.admin.AdminPaymentDetailResponseDTO;
import com.app.bideo.dto.admin.AdminPaymentListResponseDTO;
import com.app.bideo.dto.admin.AdminSearchDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminPaymentMapper {

    List<AdminPaymentListResponseDTO> selectPaymentList(AdminSearchDTO searchDTO);

    AdminPaymentDetailResponseDTO selectPaymentDetail(@Param("id") Long id);

    int countPayments(AdminSearchDTO searchDTO);
}
