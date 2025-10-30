package com.example.OnlineFoodOrdering.controller;


import com.example.OnlineFoodOrdering.entity.OrderItem;
import com.example.OnlineFoodOrdering.service.OrderItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/order-items")
@CrossOrigin(origins = "*")
public class OrderItemController {

    @Autowired
    private OrderItemService orderItemService;

    @PostMapping
    public OrderItem create(@RequestBody OrderItem item) { return orderItemService.create(item); }

    @GetMapping("/{id}")
    public ResponseEntity<OrderItem> byId(@PathVariable Long id) {
        Optional<OrderItem> item = orderItemService.findById(id);
        return item.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/order/{orderId}")
    public List<OrderItem> byOrder(@PathVariable Long orderId) { return orderItemService.findByOrder(orderId); }

    @GetMapping("/order/{orderId}/paginated")
    public Page<OrderItem> byOrderPaginated(@PathVariable Long orderId,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        return orderItemService.findByOrder(orderId, PageRequest.of(page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderItem> update(@PathVariable Long id, @RequestBody OrderItem updated) {
        Optional<OrderItem> existing = orderItemService.findById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        OrderItem item = existing.get();
        item.setQuantity(updated.getQuantity());
        item.setUnitPrice(updated.getUnitPrice());
        item.setLineTotal(updated.getLineTotal());
        return ResponseEntity.ok(orderItemService.update(item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Optional<OrderItem> existing = orderItemService.findById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        orderItemService.delete(id);
        return ResponseEntity.ok().build();
    }
}



