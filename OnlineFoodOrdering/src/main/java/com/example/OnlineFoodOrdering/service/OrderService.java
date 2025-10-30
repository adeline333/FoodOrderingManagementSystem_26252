package com.example.OnlineFoodOrdering.service;



import com.example.OnlineFoodOrdering.entity.Order;
import com.example.OnlineFoodOrdering.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    public Order createOrder(Order order) {
        return orderRepository.save(order);
    }
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }
    
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }
    
    public Order updateOrder(Order order) {
        return orderRepository.save(order);
    }
    
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
    
    public List<Order> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }
    
    public Page<Order> getOrdersByCustomer(Long customerId, Pageable pageable) {
        return orderRepository.findByCustomerId(customerId, pageable);
    }
    
    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status);
    }
    
    public Page<Order> getOrdersByStatus(Order.OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable);
    }
    
    public List<Order> getOrdersByDateRange(LocalDateTime start, LocalDateTime end) {
        return orderRepository.findByOrderDateBetween(start, end);
    }
    
    public List<Order> getOrdersByDateRange(LocalDateTime start, LocalDateTime end, Sort sort) {
        return orderRepository.findByOrderDateBetween(start, end, sort);
    }
    
    public List<Order> getOrdersByProvince(String provinceName) {
        return orderRepository.findOrdersByCustomerProvince(provinceName);
    }
    
    public Double getTotalRevenue(LocalDateTime start, LocalDateTime end) {
        return orderRepository.getTotalRevenueBetweenDates(start, end);
    }
    
    public boolean customerHasActiveOrders(Long customerId) {
        return orderRepository.hasActiveOrders(customerId);
    }
}