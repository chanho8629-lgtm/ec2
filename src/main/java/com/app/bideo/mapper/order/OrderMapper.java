package com.app.bideo.mapper.order;

import com.app.bideo.domain.order.OrderVO;
import com.app.bideo.dto.order.OrderDetailResponseDTO;
import com.app.bideo.dto.order.OrderListResponseDTO;
import com.app.bideo.dto.order.OrderSearchDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrderMapper {

    void insertOrder(OrderVO vo);

    OrderDetailResponseDTO selectById(@Param("orderId") Long orderId);

    OrderVO selectByOrderCode(@Param("orderCode") String orderCode);

    List<OrderListResponseDTO> selectByBuyerId(@Param("buyerId") Long buyerId,
                                                @Param("offset") int offset,
                                                @Param("limit") int limit);

    List<OrderListResponseDTO> selectBySellerId(@Param("sellerId") Long sellerId,
                                                 @Param("offset") int offset,
                                                 @Param("limit") int limit);

    int countByBuyerId(@Param("buyerId") Long buyerId);

    int countBySellerId(@Param("sellerId") Long sellerId);

    void updateStatus(@Param("orderId") Long orderId, @Param("status") String status);
}
