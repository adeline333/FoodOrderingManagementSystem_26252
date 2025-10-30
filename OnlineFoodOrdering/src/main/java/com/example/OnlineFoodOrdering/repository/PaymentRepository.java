package com.example.OnlineFoodOrdering.repository;


import com.example.OnlineFoodOrdering.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);
    List<Payment> findByStatus(Payment.PaymentStatus status);
    Page<Payment> findByStatus(Payment.PaymentStatus status, Pageable pageable);
    boolean existsByTransactionId(String transactionId);
}



