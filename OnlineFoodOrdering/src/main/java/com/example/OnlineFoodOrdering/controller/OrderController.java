package com.example.OnlineFoodOrdering.controller;


import com.example.OnlineFoodOrdering.entity.Order;
import com.example.OnlineFoodOrdering.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public Order create(@RequestBody Order order) { return orderService.createOrder(order); }

    @GetMapping
    public List<Order> all() { return orderService.getAllOrders(); }

    @GetMapping("/paginated")
    public Page<Order> paginated(@RequestParam(defaultValue = "0") int page,
                                 @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderService.getAllOrders(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> byId(@PathVariable Long id) {
        Optional<Order> order = orderService.getOrderById(id);
        return order.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/customer/{customerId}")
    public List<Order> byCustomer(@PathVariable Long customerId) { return orderService.getOrdersByCustomer(customerId); }

    @GetMapping("/status/{status}")
    public List<Order> byStatus(@PathVariable Order.OrderStatus status) { return orderService.getOrdersByStatus(status); }

    @GetMapping("/date-range")
    public List<Order> byDateRange(@RequestParam LocalDateTime start,
                                   @RequestParam LocalDateTime end) {
        return orderService.getOrdersByDateRange(start, end);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> update(@PathVariable Long id, @RequestBody Order updated) {
        Optional<Order> existing = orderService.getOrderById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        Order order = existing.get();
        order.setStatus(updated.getStatus());
        order.setDeliveryAddress(updated.getDeliveryAddress());
        order.setTotalAmount(updated.getTotalAmount());
        return ResponseEntity.ok(orderService.updateOrder(order));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Optional<Order> existing = orderService.getOrderById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        orderService.deleteOrder(id);
        return ResponseEntity.ok().build();
    }
}



