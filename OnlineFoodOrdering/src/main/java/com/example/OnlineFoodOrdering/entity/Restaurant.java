package com.example.OnlineFoodOrdering.entity;



import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "restaurants")
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String description;
    
    @Column(nullable = false)
    private String address;
    
    @Column(nullable = false)
    private String phone;
    
    // MANY-TO-ONE Relationship with User (Owner)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
    
    // ONE-TO-ONE Relationship with Location
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "village_id")
    private Village village;
    
    // ONE-TO-MANY Relationship with MenuItem
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MenuItem> menuItems = new ArrayList<>();
    
    // Constructors
    public Restaurant() {}
    
    public Restaurant(String name, String description, String address, String phone, User owner) {
        this.name = name;
        this.description = description;
        this.address = address;
        this.phone = phone;
        this.owner = owner;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
    
    public Village getVillage() { return village; }
    public void setVillage(Village village) { this.village = village; }
    
    public List<MenuItem> getMenuItems() { return menuItems; }
    public void setMenuItems(List<MenuItem> menuItems) { this.menuItems = menuItems; }
    
    // Helper method
    public void addMenuItem(MenuItem menuItem) {
        menuItems.add(menuItem);
        menuItem.setRestaurant(this);
    }
}