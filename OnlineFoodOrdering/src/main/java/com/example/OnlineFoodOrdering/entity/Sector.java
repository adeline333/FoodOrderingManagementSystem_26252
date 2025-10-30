package com.example.OnlineFoodOrdering.entity;



import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sectors")
public class Sector {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String code;
    
    @Column(nullable = false)
    private String name;
    
    // MANY-TO-ONE: Sector → District
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id", nullable = false)
    private District district;
    
    // ONE-TO-MANY: Sector → Cells
    @OneToMany(mappedBy = "sector", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Cell> cells = new ArrayList<>();
    
    // Constructors
    public Sector() {}
    
    public Sector(String code, String name, District district) {
        this.code = code;
        this.name = name;
        this.district = district;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public District getDistrict() { return district; }
    public void setDistrict(District district) { this.district = district; }
    
    public List<Cell> getCells() { return cells; }
    public void setCells(List<Cell> cells) { this.cells = cells; }
    
    // Helper method
    public void addCell(Cell cell) {
        cells.add(cell);
        cell.setSector(this);
    }
}
