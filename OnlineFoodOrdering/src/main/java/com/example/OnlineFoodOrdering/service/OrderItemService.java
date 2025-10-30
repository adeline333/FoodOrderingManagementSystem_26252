package com.example.OnlineFoodOrdering.service;


import com.example.OnlineFoodOrdering.entity.OrderItem;
import com.example.OnlineFoodOrdering.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderItemService {

    @Autowired
    private OrderItemRepository orderItemRepository;

    public OrderItem create(OrderItem item) { return orderItemRepository.save(item); }

    public Optional<OrderItem> findById(Long id) { return orderItemRepository.findById(id); }

    public List<OrderItem> findByOrder(Long orderId) { return orderItemRepository.findByOrderId(orderId); }

    public Page<OrderItem> findByOrder(Long orderId, Pageable pageable) { return orderItemRepository.findByOrderId(orderId, pageable); }

    public List<OrderItem> findByMenuItem(Long menuItemId) { return orderItemRepository.findByMenuItemId(menuItemId); }

    public OrderItem update(OrderItem item) { return orderItemRepository.save(item); }

    public void delete(Long id) { orderItemRepository.deleteById(id); }
}



