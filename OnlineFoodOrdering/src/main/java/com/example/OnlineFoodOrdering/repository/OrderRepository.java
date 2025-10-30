package com.example.OnlineFoodOrdering.repository;



import com.example.OnlineFoodOrdering.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Derived query methods
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByStatus(Order.OrderStatus status);
    boolean existsByCustomerIdAndStatus(Long customerId, Order.OrderStatus status);
    
    // Date range queries
    List<Order> findByOrderDateBetween(LocalDateTime start, LocalDateTime end);
    List<Order> findByOrderDateAfter(LocalDateTime date);
    List<Order> findByOrderDateBefore(LocalDateTime date);
    
    // Price-based queries
    List<Order> findByTotalAmountGreaterThanEqual(Double minAmount);
    List<Order> findByTotalAmountLessThanEqual(Double maxAmount);
    List<Order> findByTotalAmountBetween(Double minAmount, Double maxAmount);
    
    // Combined queries
    List<Order> findByStatusAndOrderDateBetween(Order.OrderStatus status, LocalDateTime start, LocalDateTime end);
    List<Order> findByCustomerIdAndStatus(Long customerId, Order.OrderStatus status);
    
    // REQUIRED: Sorting and Pagination
    Page<Order> findByCustomerId(Long customerId, Pageable pageable);
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);
    List<Order> findByOrderDateBetween(LocalDateTime start, LocalDateTime end, Sort sort);
    
    // Custom queries
    @Query("SELECT o FROM Order o WHERE o.totalAmount > :minAmount ORDER BY o.totalAmount DESC")
    List<Order> findOrdersWithTotalAmountGreaterThan(@Param("minAmount") Double minAmount);
    
    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId AND o.status = :status ORDER BY o.orderDate DESC")
    List<Order> findCustomerOrdersByStatus(@Param("customerId") Long customerId, 
                                          @Param("status") Order.OrderStatus status);
    
    // Location-based order queries
    @Query("SELECT o FROM Order o WHERE o.customer.village.cell.sector.district.province.name = :provinceName")
    List<Order> findOrdersByCustomerProvince(@Param("provinceName") String provinceName);
    
    // Statistical queries
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(@Param("status") Order.OrderStatus status);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate")
    Double getTotalRevenueBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                      @Param("endDate") LocalDateTime endDate);
    
    // Check if customer has active orders
    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM Order o WHERE o.customer.id = :customerId AND o.status IN ('PENDING', 'CONFIRMED', 'PREPARING')")
    boolean hasActiveOrders(@Param("customerId") Long customerId);
}