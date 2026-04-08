package com.app.bideo.mapper.admin;

import com.app.bideo.dto.admin.AdminAuctionDetailResponseDTO;
import com.app.bideo.dto.admin.AdminAuctionListResponseDTO;
import com.app.bideo.dto.admin.AdminSearchDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminAuctionMapper {

    List<AdminAuctionListResponseDTO> selectAuctionList(AdminSearchDTO searchDTO);

    AdminAuctionDetailResponseDTO selectAuctionDetail(@Param("id") Long id);

    int countAuctions(AdminSearchDTO searchDTO);
}
