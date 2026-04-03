package com.app.bideo.service.customerservice;

import com.app.bideo.domain.customerservice.CustomerServiceVO;
import com.app.bideo.dto.customerservice.CustomerServiceCreateRequestDTO;
import com.app.bideo.repository.customerservice.CustomerServiceDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerServiceService {

    private final CustomerServiceDAO customerServiceDAO;

    public void createInquiry(Long memberId, CustomerServiceCreateRequestDTO requestDTO) {
        CustomerServiceVO customerServiceVO = CustomerServiceVO.builder()
                .memberId(memberId)
                .category(requestDTO.getCategory())
                .content(requestDTO.getContent())
                .status("PENDING")
                .build();

        customerServiceDAO.save(customerServiceVO);
    }
}
