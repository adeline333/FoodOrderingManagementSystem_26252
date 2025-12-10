package com.example.OnlineFoodOrdering.service;

import com.example.OnlineFoodOrdering.entity.Restaurant;
import com.example.OnlineFoodOrdering.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RestaurantService {
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
    // ========== CREATE ==========
    
    public Restaurant createRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }
    
    // ========== READ ==========
    
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }
    
    public Page<Restaurant> getAllRestaurants(Pageable pageable) {
        return restaurantRepository.findAll(pageable);
    }
    
    public Optional<Restaurant> getRestaurantById(Long id) {
        return restaurantRepository.findById(id);
    }
    
    // ========== UPDATE ==========
    
    public Restaurant updateRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }
    
    // ========== DELETE ==========
    
    public void deleteRestaurant(Long id) {
        restaurantRepository.deleteById(id);
    }
    
    // ========== OWNER-BASED QUERIES ==========
    
    public List<Restaurant> getRestaurantsByOwner(Long ownerId) {
        return restaurantRepository.findByOwnerId(ownerId);
    }
    
    // ========== LOCATION-BASED QUERIES ==========
    
    // By location ID
    public List<Restaurant> getRestaurantsByLocation(Long locationId) {
        return restaurantRepository.findByLocationId(locationId);
    }
    
    // By location name
    public List<Restaurant> getRestaurantsByLocationName(String locationName) {
        return restaurantRepository.findByLocationName(locationName);
    }
    
    // By province
    public List<Restaurant> getRestaurantsByProvinceId(Long provinceId) {
        return restaurantRepository.findByProvinceId(provinceId);
    }
    
    public List<Restaurant> getRestaurantsByProvinceName(String provinceName) {
        return restaurantRepository.findByProvinceName(provinceName);
    }
    
    public List<Restaurant> getRestaurantsByProvinceCode(String provinceCode) {
        return restaurantRepository.findByProvinceCode(provinceCode);
    }
    
    // ========== SEARCH ==========
    
    public List<Restaurant> searchRestaurants(String searchTerm) {
        return restaurantRepository.searchRestaurants(searchTerm);
    }
    
    // ========== STATISTICS ==========
    
    public Long countRestaurantsByProvince(Long provinceId) {
        return restaurantRepository.countByProvinceId(provinceId);
    }
}