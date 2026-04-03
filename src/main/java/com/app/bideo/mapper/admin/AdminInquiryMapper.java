package com.app.bideo.mapper.admin;

import com.app.bideo.dto.admin.InquiryResponseDTO;
import com.app.bideo.dto.admin.InquirySearchDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminInquiryMapper {

    List<InquiryResponseDTO> selectInquiryList(InquirySearchDTO searchDTO);

    InquiryResponseDTO selectInquiryDetail(@Param("id") Long id);

    int updateInquiryReply(@Param("id") Long id, @Param("reply") String reply);

    int countInquiries(InquirySearchDTO searchDTO);
}
