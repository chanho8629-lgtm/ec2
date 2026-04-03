package com.app.bideo.repository.customerservice;

import com.app.bideo.domain.customerservice.CustomerServiceVO;
import com.app.bideo.mapper.customerservice.CustomerServiceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class CustomerServiceDAO {

    private final CustomerServiceMapper customerServiceMapper;

    public void save(CustomerServiceVO customerServiceVO) {
        customerServiceMapper.insertInquiry(customerServiceVO);
    }
}
