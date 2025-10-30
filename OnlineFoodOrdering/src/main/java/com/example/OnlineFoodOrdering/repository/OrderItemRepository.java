package com.example.OnlineFoodOrdering.repository;


import com.example.OnlineFoodOrdering.entity.OrderItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
    Page<OrderItem> findByOrderId(Long orderId, Pageable pageable);
    List<OrderItem> findByMenuItemId(Long menuItemId);
}



