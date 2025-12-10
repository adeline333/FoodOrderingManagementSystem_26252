package com.example.OnlineFoodOrdering.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "locations")
public class Location {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String code;
    
    @Column(nullable = false)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LocationType type;
    
    // Self-referential relationship: parent location
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonIgnore
    private Location parent;
    
    // Children locations
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Location> children = new ArrayList<>();
    
    // Constructors
    public Location() {}
    
    public Location(String code, String name, LocationType type) {
        this.code = code;
        this.name = name;
        this.type = type;
    }
    
    public Location(String code, String name, LocationType type, Location parent) {
        this.code = code;
        this.name = name;
        this.type = type;
        this.parent = parent;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public LocationType getType() {
        return type;
    }
    
    public void setType(LocationType type) {
        this.type = type;
    }
    
    public Location getParent() {
        return parent;
    }
    
    public void setParent(Location parent) {
        this.parent = parent;
    }
    
    public List<Location> getChildren() {
        return children;
    }
    
    public void setChildren(List<Location> children) {
        this.children = children;
    }
    
    // Helper method to add child
    public void addChild(Location child) {
        children.add(child);
        child.setParent(this);
    }
    
    // Helper method to get full hierarchy path
    public String getFullPath() {
        if (parent == null) {
            return name;
        }
        return parent.getFullPath() + " > " + name;
    }
    
    // Helper method to get province (root)
    public Location getProvince() {
        Location current = this;
        while (current.getParent() != null) {
            current = current.getParent();
        }
        return current;
    }
    
    // Enum for location types
    public enum LocationType {
        PROVINCE,
        DISTRICT,
        SECTOR,
        CELL,
        VILLAGE
    }
}