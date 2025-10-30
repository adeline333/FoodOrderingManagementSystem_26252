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
    
    public Restaurant createRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }
    
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }
    
    public Page<Restaurant> getAllRestaurants(Pageable pageable) {
        return restaurantRepository.findAll(pageable);
    }
    
    public Optional<Restaurant> getRestaurantById(Long id) {
        return restaurantRepository.findById(id);
    }
    
    public Restaurant updateRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }
    
    public void deleteRestaurant(Long id) {
        restaurantRepository.deleteById(id);
    }
    
    public List<Restaurant> getRestaurantsByOwner(Long ownerId) {
        return restaurantRepository.findByOwnerId(ownerId);
    }
    
    public List<Restaurant> getRestaurantsByProvinceName(String provinceName) {
        return restaurantRepository.findByVillageCellSectorDistrictProvinceName(provinceName);
    }
    
    public List<Restaurant> searchRestaurants(String searchTerm) {
        return restaurantRepository.searchRestaurants(searchTerm);
    }
}