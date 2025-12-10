package com.example.OnlineFoodOrdering.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

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
private boolean emailVerified = false;
    
    @Column(nullable = false)
    private String phone;
    
    @Column(nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    
    // UPDATED: Changed from Village to Location
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;
    
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
    
    public boolean isEmailVerified() { return emailVerified; }
public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    
    // UPDATED: Changed from getVillage/setVillage to getLocation/setLocation
    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }
    
    // Backward compatibility methods (optional - for gradual migration)
    @Deprecated
    public Location getVillage() { return location; }
    
    @Deprecated
    public void setVillage(Location location) { this.location = location; }
    
    public enum UserRole {
        CUSTOMER, RESTAURANT_OWNER, ADMIN, DELIVERY_PERSON
    }
}
