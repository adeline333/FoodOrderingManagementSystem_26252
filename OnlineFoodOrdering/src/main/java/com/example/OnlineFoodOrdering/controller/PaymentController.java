package com.example.OnlineFoodOrdering.controller;


import com.example.OnlineFoodOrdering.entity.Order;
import com.example.OnlineFoodOrdering.entity.Payment;
import com.example.OnlineFoodOrdering.repository.OrderRepository;
import com.example.OnlineFoodOrdering.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping
    public ResponseEntity<Payment> create(@RequestBody Payment payment) {
        // Ensure we have a valid order reference
        if (payment.getOrder() != null && payment.getOrder().getId() != null) {
            Optional<Order> order = orderRepository.findById(payment.getOrder().getId());
            if (order.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            payment.setOrder(order.get());
        } else {
            return ResponseEntity.badRequest().build();
        }

        // Set paidAt timestamp if not provided
        if (payment.getPaidAt() == null) {
            payment.setPaidAt(LocalDateTime.now());
        }

        return ResponseEntity.ok(paymentService.create(payment));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> byId(@PathVariable Long id) {
        Optional<Payment> payment = paymentService.findById(id);
        return payment.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Payment> byOrder(@PathVariable Long orderId) {
        Optional<Payment> payment = paymentService.findByOrderId(orderId);
        return payment.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public List<Payment> byStatus(@PathVariable Payment.PaymentStatus status) {
        return paymentService.findByStatus(status);
    }

    @GetMapping("/status/{status}/paginated")
    public Page<Payment> byStatusPaginated(@PathVariable Payment.PaymentStatus status,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size) {
        return paymentService.findByStatus(status, PageRequest.of(page, size));
    }

    @GetMapping("/exists-by-tx")
    public boolean existsByTransaction(@RequestParam String tx) { return paymentService.existsByTransactionId(tx); }

    @PutMapping("/{id}")
    public ResponseEntity<Payment> update(@PathVariable Long id, @RequestBody Payment updated) {
        Optional<Payment> existing = paymentService.findById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        Payment payment = existing.get();
        payment.setAmount(updated.getAmount());
        payment.setMethod(updated.getMethod());
        payment.setStatus(updated.getStatus());
        payment.setTransactionId(updated.getTransactionId());
        payment.setPaidAt(updated.getPaidAt());
        return ResponseEntity.ok(paymentService.update(payment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Optional<Payment> existing = paymentService.findById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        paymentService.delete(id);
        return ResponseEntity.ok().build();
    }
}