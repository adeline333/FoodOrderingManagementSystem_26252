package com.example.OnlineFoodOrdering.entity;



import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "provinces")
public class Province {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String code;
    
    @Column(nullable = false)
    private String name;
    
    // ONE-TO-MANY: Province → Districts
    @OneToMany(mappedBy = "province", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<District> districts = new ArrayList<>();
    
    // Constructors
    public Province() {}
    
    public Province(String code, String name) {
        this.code = code;
        this.name = name;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public List<District> getDistricts() { return districts; }
    public void setDistricts(List<District> districts) { this.districts = districts; }
    
    // Helper method
    public void addDistrict(District district) {
        districts.add(district);
        district.setProvince(this);
    }
} 
    
