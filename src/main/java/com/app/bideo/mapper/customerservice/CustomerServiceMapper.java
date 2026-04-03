package com.app.bideo.mapper.customerservice;

import com.app.bideo.domain.customerservice.CustomerServiceVO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CustomerServiceMapper {
    void insertInquiry(CustomerServiceVO customerServiceVO);
}
