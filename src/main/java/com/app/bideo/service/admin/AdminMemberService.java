package com.app.bideo.service.admin;

import com.app.bideo.dto.admin.AdminMemberDetailResponseDTO;
import com.app.bideo.dto.admin.AdminMemberListResponseDTO;
import com.app.bideo.dto.member.MemberSearchDTO;
import com.app.bideo.repository.admin.AdminMemberDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class AdminMemberService {

    private static final Set<String> VALID_MEMBER_STATUSES = Set.of("ACTIVE", "SUSPENDED", "BANNED");

    private final AdminMemberDAO adminMemberDAO;

    @Transactional(readOnly = true)
    public List<AdminMemberListResponseDTO> getMembers(MemberSearchDTO searchDTO) {
        return adminMemberDAO.findAll(searchDTO);
    }

    @Transactional(readOnly = true)
    public AdminMemberDetailResponseDTO getMemberDetail(Long id) {
        return adminMemberDAO.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("member not found"));
    }

    public void updateMemberStatus(Long id, String status) {
        if (status == null || !VALID_MEMBER_STATUSES.contains(status)) {
            throw new IllegalArgumentException("invalid member status: " + status);
        }
        adminMemberDAO.updateStatus(id, status);
    }

    @Transactional(readOnly = true)
    public int getMemberCount(MemberSearchDTO searchDTO) {
        return adminMemberDAO.count(searchDTO);
    }
}
