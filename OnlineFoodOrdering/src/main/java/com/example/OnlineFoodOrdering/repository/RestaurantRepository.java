package com.example.OnlineFoodOrdering.repository;



import com.example.OnlineFoodOrdering.entity.Restaurant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    // Derived query methods
    Optional<Restaurant> findByName(String name);
    boolean existsByName(String name);
    List<Restaurant> findByNameContainingIgnoreCase(String name);
    List<Restaurant> findByOwnerId(Long ownerId);
    
    // Location-based queries
    List<Restaurant> findByVillageId(Long villageId);
    List<Restaurant> findByVillageName(String villageName);
    List<Restaurant> findByVillageCellSectorDistrictProvinceName(String provinceName);
    List<Restaurant> findByVillageCellSectorDistrictProvinceCode(String provinceCode);
    
    // Sorting and Pagination
    Page<Restaurant> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Restaurant> findByVillageCellSectorDistrictProvinceName(String provinceName, Pageable pageable);
    
    // Custom queries
    @Query("SELECT r FROM Restaurant r WHERE " +
           "LOWER(r.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Restaurant> searchRestaurants(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT COUNT(r) FROM Restaurant r WHERE r.village.cell.sector.district.province.id = :provinceId")
    Long countByProvinceId(@Param("provinceId") Long provinceId);
}