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
    
    // Basic queries
    Optional<Restaurant> findByName(String name);
    boolean existsByName(String name);
    List<Restaurant> findByNameContainingIgnoreCase(String name);
    
    // Use underscore to navigate relationships
    List<Restaurant> findByOwner_Id(Long ownerId);
    List<Restaurant> findByLocation_Id(Long locationId);
    
    // Find by location name
    @Query("SELECT r FROM Restaurant r WHERE r.location.name = :locationName")
    List<Restaurant> findByLocationName(@Param("locationName") String locationName);
    
    // Find restaurants in a province (when location is any level in that province)
    @Query("SELECT r FROM Restaurant r WHERE " +
           "r.location.id = :provinceId OR " +
           "r.location.parent.id = :provinceId OR " +
           "r.location.parent.parent.id = :provinceId OR " +
           "r.location.parent.parent.parent.id = :provinceId OR " +
           "r.location.parent.parent.parent.parent.id = :provinceId")
    List<Restaurant> findByProvinceId(@Param("provinceId") Long provinceId);
    
    // Find restaurants by province name
    @Query("SELECT r FROM Restaurant r WHERE " +
           "(r.location.type = 'PROVINCE' AND r.location.name = :provinceName) OR " +
           "(r.location.type = 'DISTRICT' AND r.location.parent.name = :provinceName) OR " +
           "(r.location.type = 'SECTOR' AND r.location.parent.parent.name = :provinceName) OR " +
           "(r.location.type = 'CELL' AND r.location.parent.parent.parent.name = :provinceName) OR " +
           "(r.location.type = 'VILLAGE' AND r.location.parent.parent.parent.parent.name = :provinceName)")
    List<Restaurant> findByProvinceName(@Param("provinceName") String provinceName);
    
    // Find restaurants by province code
    @Query("SELECT r FROM Restaurant r WHERE " +
           "(r.location.type = 'PROVINCE' AND r.location.code = :provinceCode) OR " +
           "(r.location.type = 'DISTRICT' AND r.location.parent.code = :provinceCode) OR " +
           "(r.location.type = 'SECTOR' AND r.location.parent.parent.code = :provinceCode) OR " +
           "(r.location.type = 'CELL' AND r.location.parent.parent.parent.code = :provinceCode) OR " +
           "(r.location.type = 'VILLAGE' AND r.location.parent.parent.parent.parent.code = :provinceCode)")
    List<Restaurant> findByProvinceCode(@Param("provinceCode") String provinceCode);
    
    // Pagination
    Page<Restaurant> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    @Query("SELECT r FROM Restaurant r WHERE " +
           "(r.location.type = 'PROVINCE' AND r.location.name = :provinceName) OR " +
           "(r.location.type = 'DISTRICT' AND r.location.parent.name = :provinceName) OR " +
           "(r.location.type = 'SECTOR' AND r.location.parent.parent.name = :provinceName) OR " +
           "(r.location.type = 'CELL' AND r.location.parent.parent.parent.name = :provinceName) OR " +
           "(r.location.type = 'VILLAGE' AND r.location.parent.parent.parent.parent.name = :provinceName)")
    Page<Restaurant> findByProvinceName(@Param("provinceName") String provinceName, Pageable pageable);
    
    // Search restaurants
    @Query("SELECT r FROM Restaurant r WHERE " +
           "LOWER(r.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Restaurant> searchRestaurants(@Param("searchTerm") String searchTerm);
    
    // Count restaurants in province
    @Query("SELECT COUNT(r) FROM Restaurant r WHERE " +
           "r.location.id = :provinceId OR " +
           "r.location.parent.id = :provinceId OR " +
           "r.location.parent.parent.id = :provinceId OR " +
           "r.location.parent.parent.parent.id = :provinceId OR " +
           "r.location.parent.parent.parent.parent.id = :provinceId")
    Long countByProvinceId(@Param("provinceId") Long provinceId);
}