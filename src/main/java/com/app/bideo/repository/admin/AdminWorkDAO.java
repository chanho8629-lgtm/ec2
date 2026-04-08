package com.app.bideo.repository.admin;

import com.app.bideo.dto.admin.AdminSearchDTO;
import com.app.bideo.dto.admin.AdminWorkDetailResponseDTO;
import com.app.bideo.dto.admin.AdminWorkListResponseDTO;
import com.app.bideo.mapper.admin.AdminWorkMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AdminWorkDAO {

    private final AdminWorkMapper adminWorkMapper;

    public List<AdminWorkListResponseDTO> findAll(AdminSearchDTO searchDTO) {
        return adminWorkMapper.selectWorkList(searchDTO);
    }

    public Optional<AdminWorkDetailResponseDTO> findById(Long id) {
        return Optional.ofNullable(adminWorkMapper.selectWorkDetail(id));
    }

    public void updateStatus(Long id, String status) {
        if (adminWorkMapper.updateWorkStatus(id, status) == 0) {
            throw new IllegalArgumentException("work not found");
        }
    }

    public int count(AdminSearchDTO searchDTO) {
        return adminWorkMapper.countWorks(searchDTO);
    }
}
