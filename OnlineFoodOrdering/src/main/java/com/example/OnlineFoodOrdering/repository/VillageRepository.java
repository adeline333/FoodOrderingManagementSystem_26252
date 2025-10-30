package com.example.OnlineFoodOrdering.repository;



import com.example.OnlineFoodOrdering.entity.Village;
import com.example.OnlineFoodOrdering.entity.Cell;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VillageRepository extends JpaRepository<Village, Long> {
    // Derived query methods
    Optional<Village> findByCode(String code);
    Optional<Village> findByName(String name);
    boolean existsByCode(String code);
    boolean existsByName(String name);
    List<Village> findByNameContainingIgnoreCase(String name);
    
    // Village-specific queries
    List<Village> findByCell(Cell cell);
    List<Village> findByCellId(Long cellId);
    List<Village> findByCellCode(String cellCode);
    List<Village> findByCellName(String cellName);
    
    // Multi-level hierarchical queries
    List<Village> findByCellSectorName(String sectorName);
    List<Village> findByCellSectorDistrictName(String districtName);
    List<Village> findByCellSectorDistrictProvinceName(String provinceName);
    
    // Complete hierarchical query
    @Query("SELECT v FROM Village v WHERE v.cell.sector.district.province.name = :provinceName")
    List<Village> findByProvinceName(@Param("provinceName") String provinceName);
    
    @Query("SELECT v FROM Village v WHERE v.cell.sector.district.province.code = :provinceCode")
    List<Village> findByProvinceCode(@Param("provinceCode") String provinceCode);
    
    // Count queries
    @Query("SELECT COUNT(v) FROM Village v WHERE v.cell.sector.district.province.id = :provinceId")
    Long countByProvinceId(@Param("provinceId") Long provinceId);
}