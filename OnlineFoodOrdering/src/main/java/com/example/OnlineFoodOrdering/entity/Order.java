package com.example.OnlineFoodOrdering.entity;

import com.example.OnlineFoodOrdering.entity.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private LocalDateTime orderDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;
    
    @Column(nullable = false)
    private Double totalAmount;
    
    private String deliveryAddress;
    
    // MANY-TO-ONE Relationship with User (Customer)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;
    
    // MANY-TO-MANY Relationship with MenuItem
    @ManyToMany
    @JoinTable(
        name = "order_menu_items",
        joinColumns = @JoinColumn(name = "order_id"),
        inverseJoinColumns = @JoinColumn(name = "menu_item_id")
    )
    private List<MenuItem> menuItems = new ArrayList<>();
    
    // Constructors
    public Order() {}
    
    public Order(User customer, String deliveryAddress) {
        this.orderDate = LocalDateTime.now();
        this.status = OrderStatus.PENDING;
        this.customer = customer;
        this.deliveryAddress = deliveryAddress;
        this.totalAmount = 0.0;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }
    
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    
    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }
    
    public List<MenuItem> getMenuItems() { return menuItems; }
    public void setMenuItems(List<MenuItem> menuItems) { this.menuItems = menuItems; }
    
    public void addMenuItem(MenuItem menuItem) {
        this.menuItems.add(menuItem);
        if (this.totalAmount == null) {
            this.totalAmount = 0.0;
        }
        this.totalAmount += menuItem.getPrice();
    }
    
    public enum OrderStatus {
        PENDING, CONFIRMED, PREPARING, ON_THE_WAY, DELIVERED, CANCELLED
    }
}