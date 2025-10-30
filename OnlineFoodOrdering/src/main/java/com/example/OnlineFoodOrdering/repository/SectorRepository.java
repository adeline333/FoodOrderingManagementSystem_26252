package com.example.OnlineFoodOrdering.repository;



import com.example.OnlineFoodOrdering.entity.Sector;
import com.example.OnlineFoodOrdering.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SectorRepository extends JpaRepository<Sector, Long> {
    // Derived query methods
    Optional<Sector> findByCode(String code);
    Optional<Sector> findByName(String name);
    boolean existsByCode(String code);
    boolean existsByName(String name);
    List<Sector> findByNameContainingIgnoreCase(String name);
    
    // Sector-specific queries
    List<Sector> findByDistrict(District district);
    List<Sector> findByDistrictId(Long districtId);
    List<Sector> findByDistrictCode(String districtCode);
    List<Sector> findByDistrictName(String districtName);
    
    // Cross-level queries
    List<Sector> findByDistrictProvinceName(String provinceName);
    List<Sector> findByDistrictProvinceCode(String provinceCode);
    
    // Custom queries
    @Query("SELECT s FROM Sector s WHERE s.district.name = :districtName AND s.name = :sectorName")
    Optional<Sector> findByDistrictNameAndSectorName(@Param("districtName") String districtName, 
                                                    @Param("sectorName") String sectorName);
    
    @Query("SELECT COUNT(s) FROM Sector s WHERE s.district.id = :districtId")
    Long countByDistrictId(@Param("districtId") Long districtId);
}