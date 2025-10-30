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
    // Derived query methods
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByFirstNameContainingIgnoreCase(String firstName);
    List<User> findByLastNameContainingIgnoreCase(String lastName);
    List<User> findByRole(User.UserRole role);
    
    // Sorting and Pagination
    Page<User> findByRole(User.UserRole role, Pageable pageable);
    Page<User> findByFirstNameContainingIgnoreCase(String firstName, Pageable pageable);
    
    // REQUIRED: Custom query for finding users by province
    @Query("SELECT u FROM User u WHERE u.village.cell.sector.district.province.code = :provinceCode")
    List<User> findByProvinceCode(@Param("provinceCode") String provinceCode);
    
    @Query("SELECT u FROM User u WHERE u.village.cell.sector.district.province.name = :provinceName")
    List<User> findByProvinceName(@Param("provinceName") String provinceName);
    
    // Additional location-based queries
    @Query("SELECT u FROM User u WHERE u.village.cell.sector.district.name = :districtName")
    List<User> findByDistrictName(@Param("districtName") String districtName);
    
    @Query("SELECT u FROM User u WHERE u.village.cell.sector.name = :sectorName")
    List<User> findBySectorName(@Param("sectorName") String sectorName);
    
    // Check if user exists in specific location
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.email = :email AND u.village.cell.sector.district.province.name = :provinceName")
    boolean existsByEmailAndProvinceName(@Param("email") String email, @Param("provinceName") String provinceName);
}