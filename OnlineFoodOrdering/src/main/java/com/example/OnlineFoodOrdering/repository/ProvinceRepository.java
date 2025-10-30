package com.example.OnlineFoodOrdering.repository;



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
public interface ProvinceRepository extends JpaRepository<Province, Long> {
    // Derived query methods
    Optional<Province> findByCode(String code);
    Optional<Province> findByName(String name);
    boolean existsByCode(String code);
    boolean existsByName(String name);
    List<Province> findByNameContainingIgnoreCase(String name);
    
    // Sorting and Pagination
    Page<Province> findAll(Pageable pageable);
    Page<Province> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    // Custom query
    @Query("SELECT p FROM Province p ORDER BY p.name ASC")
    List<Province> findAllOrderByNameAsc();
}