package com.app.bideo.repository.admin;

import com.app.bideo.dto.admin.InquiryResponseDTO;
import com.app.bideo.dto.admin.InquirySearchDTO;
import com.app.bideo.mapper.admin.AdminInquiryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AdminInquiryDAO {

    private final AdminInquiryMapper adminInquiryMapper;

    public List<InquiryResponseDTO> findAll(InquirySearchDTO searchDTO) {
        return adminInquiryMapper.selectInquiryList(searchDTO);
    }

    public Optional<InquiryResponseDTO> findById(Long id) {
        return Optional.ofNullable(adminInquiryMapper.selectInquiryDetail(id));
    }

    public void updateReply(Long id, String reply) {
        if (adminInquiryMapper.updateInquiryReply(id, reply) == 0) {
            throw new IllegalArgumentException("inquiry not found");
        }
    }

    public int count(InquirySearchDTO searchDTO) {
        return adminInquiryMapper.countInquiries(searchDTO);
    }
}
