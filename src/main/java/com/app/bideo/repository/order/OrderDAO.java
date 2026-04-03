package com.app.bideo.repository.order;

import com.app.bideo.domain.order.OrderVO;
import com.app.bideo.dto.order.OrderDetailResponseDTO;
import com.app.bideo.dto.order.OrderListResponseDTO;
import com.app.bideo.mapper.order.OrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class OrderDAO {

    private final OrderMapper orderMapper;

    public void save(OrderVO vo) {
        orderMapper.insertOrder(vo);
    }

    public Optional<OrderDetailResponseDTO> findById(Long orderId) {
        return Optional.ofNullable(orderMapper.selectById(orderId));
    }

    public OrderVO findByOrderCode(String orderCode) {
        return orderMapper.selectByOrderCode(orderCode);
    }

    public List<OrderListResponseDTO> findByBuyerId(Long buyerId, int offset, int limit) {
        return orderMapper.selectByBuyerId(buyerId, offset, limit);
    }

    public List<OrderListResponseDTO> findBySellerId(Long sellerId, int offset, int limit) {
        return orderMapper.selectBySellerId(sellerId, offset, limit);
    }

    public int countByBuyerId(Long buyerId) {
        return orderMapper.countByBuyerId(buyerId);
    }

    public int countBySellerId(Long sellerId) {
        return orderMapper.countBySellerId(sellerId);
    }

    public void updateStatus(Long orderId, String status) {
        orderMapper.updateStatus(orderId, status);
    }
}
