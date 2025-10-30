package com.example.OnlineFoodOrdering.service;


import com.example.OnlineFoodOrdering.entity.Payment;
import com.example.OnlineFoodOrdering.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    public Payment create(Payment payment) { return paymentRepository.save(payment); }

    public Optional<Payment> findById(Long id) { return paymentRepository.findById(id); }

    public Optional<Payment> findByOrderId(Long orderId) { return paymentRepository.findByOrderId(orderId); }

    public List<Payment> findByStatus(Payment.PaymentStatus status) { return paymentRepository.findByStatus(status); }

    public Page<Payment> findByStatus(Payment.PaymentStatus status, Pageable pageable) { return paymentRepository.findByStatus(status, pageable); }

    public boolean existsByTransactionId(String transactionId) { return paymentRepository.existsByTransactionId(transactionId); }

    public Payment update(Payment payment) { return paymentRepository.save(payment); }

    public void delete(Long id) { paymentRepository.deleteById(id); }
}



