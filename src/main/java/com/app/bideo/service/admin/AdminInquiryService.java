package com.app.bideo.service.admin;

import com.app.bideo.dto.admin.InquiryResponseDTO;
import com.app.bideo.dto.admin.InquirySearchDTO;
import com.app.bideo.repository.admin.AdminInquiryDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class AdminInquiryService {

    private final AdminInquiryDAO adminInquiryDAO;

    @Transactional(readOnly = true)
    public List<InquiryResponseDTO> getInquiries(InquirySearchDTO searchDTO) {
        return adminInquiryDAO.findAll(searchDTO);
    }

    @Transactional(readOnly = true)
    public InquiryResponseDTO getInquiryDetail(Long id) {
        return adminInquiryDAO.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("inquiry not found"));
    }

    public void replyInquiry(Long id, String reply) {
        if (reply == null || reply.trim().isEmpty()) {
            throw new IllegalArgumentException("reply content is required");
        }
        adminInquiryDAO.updateReply(id, reply.trim());
    }

    @Transactional(readOnly = true)
    public int getInquiryCount(InquirySearchDTO searchDTO) {
        return adminInquiryDAO.count(searchDTO);
    }
}
