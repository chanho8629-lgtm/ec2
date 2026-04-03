package com.app.bideo.repository.admin;

import com.app.bideo.dto.admin.AdminMemberDetailResponseDTO;
import com.app.bideo.dto.admin.AdminMemberListResponseDTO;
import com.app.bideo.dto.member.MemberSearchDTO;
import com.app.bideo.mapper.admin.AdminMemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AdminMemberDAO {

    private final AdminMemberMapper adminMemberMapper;

    public List<AdminMemberListResponseDTO> findAll(MemberSearchDTO searchDTO) {
        return adminMemberMapper.selectMemberList(searchDTO);
    }

    public Optional<AdminMemberDetailResponseDTO> findById(Long id) {
        return Optional.ofNullable(adminMemberMapper.selectMemberDetail(id));
    }

    public void updateStatus(Long id, String status) {
        if (adminMemberMapper.updateMemberStatus(id, status) == 0) {
            throw new IllegalArgumentException("member not found");
        }
    }

    public int count(MemberSearchDTO searchDTO) {
        return adminMemberMapper.countMembers(searchDTO);
    }
}
