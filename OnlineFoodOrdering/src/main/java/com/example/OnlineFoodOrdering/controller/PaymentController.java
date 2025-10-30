package com.example.OnlineFoodOrdering.controller;


import com.example.OnlineFoodOrdering.entity.Payment;
import com.example.OnlineFoodOrdering.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public Payment create(@RequestBody Payment payment) { return paymentService.create(payment); }

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



