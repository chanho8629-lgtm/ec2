package com.app.bideo.mapper.admin;

import com.app.bideo.dto.admin.AdminMemberDetailResponseDTO;
import com.app.bideo.dto.admin.AdminMemberListResponseDTO;
import com.app.bideo.dto.member.MemberSearchDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminMemberMapper {

    List<AdminMemberListResponseDTO> selectMemberList(MemberSearchDTO searchDTO);

    AdminMemberDetailResponseDTO selectMemberDetail(@Param("id") Long id);

    int updateMemberStatus(@Param("id") Long id, @Param("status") String status);

    int countMembers(MemberSearchDTO searchDTO);
}
