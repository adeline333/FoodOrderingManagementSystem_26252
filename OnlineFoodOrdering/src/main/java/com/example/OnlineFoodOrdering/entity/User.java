package com.example.OnlineFoodOrdering.entity;

import jakarta.persistence.*;

import jakarta.persistence.Entity;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String phone;
    
    @Column(nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
    
    // ONE-TO-ONE Relationship with Location (Village)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "village_id")
    private Village village;
    
    // Constructors
    public User() {}
    
    public User(String firstName, String lastName, String email, String phone, String password, UserRole role) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.role = role;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    
    public Village getVillage() { return village; }
    public void setVillage(Village village) { this.village = village; }
    
    public enum UserRole {
        CUSTOMER, RESTAURANT_OWNER, ADMIN, DELIVERY_PERSON
    }
}