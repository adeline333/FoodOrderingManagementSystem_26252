package com.example.OnlineFoodOrdering.repository;


import com.example.OnlineFoodOrdering.entity.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    // Derived query methods
    Optional<MenuItem> findByName(String name);
    boolean existsByName(String name);
    List<MenuItem> findByNameContainingIgnoreCase(String name);
    List<MenuItem> findByRestaurantId(Long restaurantId);
    List<MenuItem> findByCategory(MenuItem.FoodCategory category);
    
    // Price range queries
    List<MenuItem> findByPriceBetween(Double minPrice, Double maxPrice);
    List<MenuItem> findByPriceLessThanEqual(Double maxPrice);
    List<MenuItem> findByPriceGreaterThanEqual(Double minPrice);
    
    // Combined queries
    List<MenuItem> findByRestaurantIdAndCategory(Long restaurantId, MenuItem.FoodCategory category);
    List<MenuItem> findByRestaurantIdAndPriceBetween(Long restaurantId, Double minPrice, Double maxPrice);
    
    // Sorting and Pagination
    Page<MenuItem> findByRestaurantId(Long restaurantId, Pageable pageable);
    Page<MenuItem> findByCategory(MenuItem.FoodCategory category, Pageable pageable);
    Page<MenuItem> findByPriceBetween(Double minPrice, Double maxPrice, Pageable pageable);
    
    // Custom queries
    @Query("SELECT mi FROM MenuItem mi WHERE mi.restaurant.id = :restaurantId ORDER BY mi.price ASC")
    List<MenuItem> findByRestaurantIdOrderByPriceAsc(@Param("restaurantId") Long restaurantId);
    
    @Query("SELECT mi FROM MenuItem mi WHERE mi.restaurant.id = :restaurantId ORDER BY mi.price DESC")
    List<MenuItem> findByRestaurantIdOrderByPriceDesc(@Param("restaurantId") Long restaurantId);
    
    @Query("SELECT COUNT(mi) FROM MenuItem mi WHERE mi.restaurant.id = :restaurantId AND mi.category = :category")
    Long countByRestaurantIdAndCategory(@Param("restaurantId") Long restaurantId, 
                                       @Param("category") MenuItem.FoodCategory category);
}