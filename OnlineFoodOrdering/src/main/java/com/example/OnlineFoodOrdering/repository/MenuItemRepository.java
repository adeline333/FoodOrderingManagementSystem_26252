package com.example.OnlineFoodOrdering.repository;

import com.example.OnlineFoodOrdering.entity.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    
    Optional<MenuItem> findByName(String name);
    
    boolean existsByName(String name);
    
    List<MenuItem> findByNameContainingIgnoreCase(String name);
    
    List<MenuItem> findByDescriptionContainingIgnoreCase(String description);
    
    // Use underscore to navigate the relationship
    List<MenuItem> findByRestaurant_Id(Long restaurantId);
    
    List<MenuItem> findByCategory(MenuItem.FoodCategory category);
    
    Page<MenuItem> findByCategory(MenuItem.FoodCategory category, Pageable pageable);
    
    List<MenuItem> findByPriceBetween(Double minPrice, Double maxPrice);
}