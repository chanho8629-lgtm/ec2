package com.app.bideo.mapper.admin;

import com.app.bideo.dto.admin.AdminRestrictionResponseDTO;
import com.app.bideo.dto.admin.AdminRestrictionSearchDTO;
import com.app.bideo.dto.admin.AdminRestrictionUpsertRequestDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminRestrictionMapper {

    List<AdminRestrictionResponseDTO> selectRestrictionList(AdminRestrictionSearchDTO searchDTO);

    AdminRestrictionResponseDTO selectRestrictionDetail(@Param("id") Long id);

    AdminRestrictionResponseDTO selectActiveRestrictionByMemberId(@Param("memberId") Long memberId);

    List<AdminRestrictionResponseDTO> selectExpirableRestrictions();

    int insertRestriction(AdminRestrictionUpsertRequestDTO requestDTO);

    int updateRestriction(@Param("id") Long id, @Param("request") AdminRestrictionUpsertRequestDTO requestDTO);

    int releaseRestriction(@Param("id") Long id);

    int expireRestrictions();
}
