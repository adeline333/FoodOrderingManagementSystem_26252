package com.example.OnlineFoodOrdering.repository;

import com.example.OnlineFoodOrdering.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Basic queries
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByFirstNameContainingIgnoreCase(String firstName);
    List<User> findByLastNameContainingIgnoreCase(String lastName);
    List<User> findByRole(User.UserRole role);
    
    // Pagination
    Page<User> findByRole(User.UserRole role, Pageable pageable);
    Page<User> findByFirstNameContainingIgnoreCase(String firstName, Pageable pageable);
    
    // UPDATED: Location-based queries using new Location entity
    
    // Find by specific location
    List<User> findByLocationId(Long locationId);
    
    // Find by location code
    @Query("SELECT u FROM User u WHERE u.location.code = :locationCode")
    List<User> findByLocationCode(@Param("locationCode") String locationCode);
    
    // Find by location name
    @Query("SELECT u FROM User u WHERE u.location.name = :locationName")
    List<User> findByLocationName(@Param("locationName") String locationName);
    
    // Find users in a province (when location is any level in that province)
    @Query("SELECT u FROM User u WHERE " +
           "u.location.id = :provinceId OR " +
           "u.location.parent.id = :provinceId OR " +
           "u.location.parent.parent.id = :provinceId OR " +
           "u.location.parent.parent.parent.id = :provinceId OR " +
           "u.location.parent.parent.parent.parent.id = :provinceId")
    List<User> findByProvinceId(@Param("provinceId") Long provinceId);
    
    // Find users by province name
    @Query("SELECT u FROM User u WHERE " +
           "(u.location.type = 'PROVINCE' AND u.location.name = :provinceName) OR " +
           "(u.location.type = 'DISTRICT' AND u.location.parent.name = :provinceName) OR " +
           "(u.location.type = 'SECTOR' AND u.location.parent.parent.name = :provinceName) OR " +
           "(u.location.type = 'CELL' AND u.location.parent.parent.parent.name = :provinceName) OR " +
           "(u.location.type = 'VILLAGE' AND u.location.parent.parent.parent.parent.name = :provinceName)")
    List<User> findByProvinceName(@Param("provinceName") String provinceName);
    
    // Find users by province code
    @Query("SELECT u FROM User u WHERE " +
           "(u.location.type = 'PROVINCE' AND u.location.code = :provinceCode) OR " +
           "(u.location.type = 'DISTRICT' AND u.location.parent.code = :provinceCode) OR " +
           "(u.location.type = 'SECTOR' AND u.location.parent.parent.code = :provinceCode) OR " +
           "(u.location.type = 'CELL' AND u.location.parent.parent.parent.code = :provinceCode) OR " +
           "(u.location.type = 'VILLAGE' AND u.location.parent.parent.parent.parent.code = :provinceCode)")
    List<User> findByProvinceCode(@Param("provinceCode") String provinceCode);
    
    // Find users by district name
    @Query("SELECT u FROM User u WHERE " +
           "(u.location.type = 'DISTRICT' AND u.location.name = :districtName) OR " +
           "(u.location.type = 'SECTOR' AND u.location.parent.name = :districtName) OR " +
           "(u.location.type = 'CELL' AND u.location.parent.parent.name = :districtName) OR " +
           "(u.location.type = 'VILLAGE' AND u.location.parent.parent.parent.name = :districtName)")
    List<User> findByDistrictName(@Param("districtName") String districtName);
    
    // Find users by sector name
    @Query("SELECT u FROM User u WHERE " +
           "(u.location.type = 'SECTOR' AND u.location.name = :sectorName) OR " +
           "(u.location.type = 'CELL' AND u.location.parent.name = :sectorName) OR " +
           "(u.location.type = 'VILLAGE' AND u.location.parent.parent.name = :sectorName)")
    List<User> findBySectorName(@Param("sectorName") String sectorName);
    
    // Check if user exists in specific province
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE " +
           "u.email = :email AND (" +
           "(u.location.type = 'PROVINCE' AND u.location.name = :provinceName) OR " +
           "(u.location.type = 'DISTRICT' AND u.location.parent.name = :provinceName) OR " +
           "(u.location.type = 'SECTOR' AND u.location.parent.parent.name = :provinceName) OR " +
           "(u.location.type = 'CELL' AND u.location.parent.parent.parent.name = :provinceName) OR " +
           "(u.location.type = 'VILLAGE' AND u.location.parent.parent.parent.parent.name = :provinceName))")
    boolean existsByEmailAndProvinceName(@Param("email") String email, @Param("provinceName") String provinceName);
}