package com.example.OnlineFoodOrdering.controller;


import com.example.OnlineFoodOrdering.entity.MenuItem;
import com.example.OnlineFoodOrdering.entity.Order;
import com.example.OnlineFoodOrdering.entity.OrderItem;
import com.example.OnlineFoodOrdering.entity.User;
import com.example.OnlineFoodOrdering.repository.MenuItemRepository;
import com.example.OnlineFoodOrdering.repository.UserRepository;
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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @PostMapping
    public ResponseEntity<Order> create(@RequestBody Order order) {
        // Resolve customer reference
        if (order.getCustomer() != null && order.getCustomer().getId() != null) {
            Optional<User> customer = userRepository.findById(order.getCustomer().getId());
            if (customer.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            order.setCustomer(customer.get());
        } else {
            return ResponseEntity.badRequest().build();
        }

        // Resolve menuItem references in orderItems
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                if (item.getMenuItem() != null && item.getMenuItem().getId() != null) {
                    Optional<MenuItem> menuItem = menuItemRepository.findById(item.getMenuItem().getId());
                    if (menuItem.isEmpty()) {
                        return ResponseEntity.badRequest().build();
                    }
                    item.setMenuItem(menuItem.get());
                }
            }
        }

        return ResponseEntity.ok(orderService.createOrder(order));
    }

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

    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestParam Order.OrderStatus status) {
        Optional<Order> existing = orderService.getOrderById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        Order order = existing.get();
        order.setStatus(status);
        return ResponseEntity.ok(orderService.updateOrder(order));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Optional<Order> existing = orderService.getOrderById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        orderService.deleteOrder(id);
        return ResponseEntity.ok().build();
    }

    // Restaurant-specific endpoints
    @GetMapping("/restaurant/{restaurantId}")
    public List<Order> byRestaurant(@PathVariable Long restaurantId) {
        return orderService.getOrdersByRestaurant(restaurantId);
    }

    @GetMapping("/restaurant/{restaurantId}/pending")
    public List<Order> pendingByRestaurant(@PathVariable Long restaurantId) {
        return orderService.getPendingOrdersByRestaurant(restaurantId);
    }

    @GetMapping("/restaurant/{restaurantId}/stats")
    public ResponseEntity<?> restaurantStats(@PathVariable Long restaurantId) {
        Long orderCount = orderService.countOrdersByRestaurant(restaurantId);
        Double revenue = orderService.getRestaurantRevenue(restaurantId);
        List<Order> pendingOrders = orderService.getPendingOrdersByRestaurant(restaurantId);

        return ResponseEntity.ok(java.util.Map.of(
            "totalOrders", orderCount,
            "totalRevenue", revenue,
            "pendingOrders", pendingOrders.size()
        ));
    }
}



