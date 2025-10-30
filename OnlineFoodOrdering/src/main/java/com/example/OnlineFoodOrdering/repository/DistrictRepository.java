package com.example.OnlineFoodOrdering.repository;



import com.example.OnlineFoodOrdering.entity.District;
import com.example.OnlineFoodOrdering.entity.Province;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DistrictRepository extends JpaRepository<District, Long> {
    // Derived query methods
    Optional<District> findByCode(String code);
    Optional<District> findByName(String name);
    boolean existsByCode(String code);
    boolean existsByName(String name);
    List<District> findByNameContainingIgnoreCase(String name);
    
    // District-specific queries
    List<District> findByProvince(Province province);
    List<District> findByProvinceId(Long provinceId);
    List<District> findByProvinceCode(String provinceCode);
    List<District> findByProvinceName(String provinceName);
    
    // Sorting and Pagination
    Page<District> findByProvinceId(Long provinceId, Pageable pageable);
    
    // Custom queries
    @Query("SELECT d FROM District d WHERE d.province.name = :provinceName ORDER BY d.name")
    List<District> findDistrictsByProvinceNameOrdered(@Param("provinceName") String provinceName);
    
    @Query("SELECT COUNT(d) FROM District d WHERE d.province.id = :provinceId")
    Long countByProvinceId(@Param("provinceId") Long provinceId);
}