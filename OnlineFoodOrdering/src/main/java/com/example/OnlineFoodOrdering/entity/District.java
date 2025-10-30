package com.example.OnlineFoodOrdering.entity;



import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "districts")
public class District {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String code;
    
    @Column(nullable = false)
    private String name;
    
    // MANY-TO-ONE: District → Province
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_id", nullable = false)
    private Province province;
    
    // ONE-TO-MANY: District → Sectors
    @OneToMany(mappedBy = "district", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Sector> sectors = new ArrayList<>();
    
    // Constructors
    public District() {}
    
    public District(String code, String name, Province province) {
        this.code = code;
        this.name = name;
        this.province = province;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Province getProvince() { return province; }
    public void setProvince(Province province) { this.province = province; }
    
    public List<Sector> getSectors() { return sectors; }
    public void setSectors(List<Sector> sectors) { this.sectors = sectors; }
    
    // Helper method
    public void addSector(Sector sector) {
        sectors.add(sector);
        sector.setDistrict(this);
    }
}