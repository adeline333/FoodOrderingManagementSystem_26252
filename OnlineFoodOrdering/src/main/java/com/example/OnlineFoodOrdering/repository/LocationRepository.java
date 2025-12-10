package com.example.OnlineFoodOrdering.repository;

import com.example.OnlineFoodOrdering.entity.Location;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    
    // Basic queries
    Optional<Location> findByCode(String code);
    Optional<Location> findByName(String name);
    boolean existsByCode(String code);
    boolean existsByName(String name);
    List<Location> findByNameContainingIgnoreCase(String name);
    
    // Type-based queries
    List<Location> findByType(Location.LocationType type);
    Page<Location> findByType(Location.LocationType type, Pageable pageable);
    
    // Parent-child queries
    List<Location> findByParentId(Long parentId);
    List<Location> findByParentIdOrderByNameAsc(Long parentId);
    List<Location> findByParentIsNull(); // Get all provinces (top-level)
    
    // Combined queries
    List<Location> findByTypeAndParentId(Location.LocationType type, Long parentId);
    Optional<Location> findByCodeAndType(String code, Location.LocationType type);
    
    // Search by type and name
    List<Location> findByTypeAndNameContainingIgnoreCase(Location.LocationType type, String name);
    
    // Get all children recursively
    @Query("SELECT l FROM Location l WHERE l.parent.id = :parentId")
    List<Location> findAllByParentId(@Param("parentId") Long parentId);
    
    // Get provinces (root locations)
    @Query("SELECT l FROM Location l WHERE l.type = 'PROVINCE' AND l.parent IS NULL ORDER BY l.name ASC")
    List<Location> findAllProvinces();
    
    // Get districts by province
    @Query("SELECT l FROM Location l WHERE l.type = 'DISTRICT' AND l.parent.id = :provinceId ORDER BY l.name ASC")
    List<Location> findDistrictsByProvinceId(@Param("provinceId") Long provinceId);
    
    // Get sectors by district
    @Query("SELECT l FROM Location l WHERE l.type = 'SECTOR' AND l.parent.id = :districtId ORDER BY l.name ASC")
    List<Location> findSectorsByDistrictId(@Param("districtId") Long districtId);
    
    // Get cells by sector
    @Query("SELECT l FROM Location l WHERE l.type = 'CELL' AND l.parent.id = :sectorId ORDER BY l.name ASC")
    List<Location> findCellsBySectorId(@Param("sectorId") Long sectorId);
    
    // Get villages by cell
    @Query("SELECT l FROM Location l WHERE l.type = 'VILLAGE' AND l.parent.id = :cellId ORDER BY l.name ASC")
    List<Location> findVillagesByCellId(@Param("cellId") Long cellId);
    
    // Get all locations in a province (any level)
    @Query("SELECT l FROM Location l WHERE " +
           "l.id = :provinceId OR " +
           "l.parent.id = :provinceId OR " +
           "l.parent.parent.id = :provinceId OR " +
           "l.parent.parent.parent.id = :provinceId OR " +
           "l.parent.parent.parent.parent.id = :provinceId")
    List<Location> findAllInProvince(@Param("provinceId") Long provinceId);
    
    // Get province by any child location
    @Query("SELECT CASE " +
           "WHEN l.type = 'PROVINCE' THEN l " +
           "WHEN l.type = 'DISTRICT' THEN l.parent " +
           "WHEN l.type = 'SECTOR' THEN l.parent.parent " +
           "WHEN l.type = 'CELL' THEN l.parent.parent.parent " +
           "WHEN l.type = 'VILLAGE' THEN l.parent.parent.parent.parent " +
           "END FROM Location l WHERE l.id = :locationId")
    Location findProvinceByLocationId(@Param("locationId") Long locationId);
    
    // Count children
    @Query("SELECT COUNT(l) FROM Location l WHERE l.parent.id = :parentId")
    Long countByParentId(@Param("parentId") Long parentId);
    
    // Search across all types
    @Query("SELECT l FROM Location l WHERE " +
           "LOWER(l.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(l.code) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Location> searchLocations(@Param("searchTerm") String searchTerm);
    
    // Get full path
    @Query("SELECT l FROM Location l WHERE l.code = :code")
    Optional<Location> findByCodeWithParents(@Param("code") String code);
}