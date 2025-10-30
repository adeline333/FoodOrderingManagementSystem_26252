package com.example.OnlineFoodOrdering.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "villages")
public class Village {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String code;
    
    @Column(nullable = false)
    private String name;
    
    // MANY-TO-ONE: Village → Cell
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cell_id", nullable = false)
    private Cell cell;
    
    // Constructors
    public Village() {}
    
    public Village(String code, String name, Cell cell) {
        this.code = code;
        this.name = name;
        this.cell = cell;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Cell getCell() { return cell; }
    public void setCell(Cell cell) { this.cell = cell; }
}