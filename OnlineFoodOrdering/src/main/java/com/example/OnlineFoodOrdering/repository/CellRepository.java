package com.example.OnlineFoodOrdering.repository;



import com.example.OnlineFoodOrdering.entity.Cell;
import com.example.OnlineFoodOrdering.entity.Sector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CellRepository extends JpaRepository<Cell, Long> {
    // Derived query methods
    Optional<Cell> findByCode(String code);
    Optional<Cell> findByName(String name);
    boolean existsByCode(String code);
    boolean existsByName(String name);
    List<Cell> findByNameContainingIgnoreCase(String name);
    
    // Cell-specific queries
    List<Cell> findBySector(Sector sector);
    List<Cell> findBySectorId(Long sectorId);
    List<Cell> findBySectorCode(String sectorCode);
    List<Cell> findBySectorName(String sectorName);
    
    // Multi-level queries
    List<Cell> findBySectorDistrictName(String districtName);
    List<Cell> findBySectorDistrictProvinceName(String provinceName);
    
    // Custom queries
    @Query("SELECT c FROM Cell c WHERE c.sector.district.name = :districtName AND c.sector.name = :sectorName")
    List<Cell> findByDistrictAndSector(@Param("districtName") String districtName, 
                                      @Param("sectorName") String sectorName);
    
    @Query("SELECT COUNT(c) FROM Cell c WHERE c.sector.id = :sectorId")
    Long countBySectorId(@Param("sectorId") Long sectorId);
}