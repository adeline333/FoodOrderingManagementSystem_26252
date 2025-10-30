package com.example.OnlineFoodOrdering.controller;


import com.example.OnlineFoodOrdering.entity.Restaurant;
import com.example.OnlineFoodOrdering.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*")
public class RestaurantController {
    
    @Autowired
    private RestaurantService restaurantService;
    
    // CREATE
    @PostMapping
    public Restaurant createRestaurant(@RequestBody Restaurant restaurant) {
        return restaurantService.createRestaurant(restaurant);
    }
    
    // READ ALL
    @GetMapping
    public List<Restaurant> getAllRestaurants() {
        return restaurantService.getAllRestaurants();
    }
    
    // READ ALL WITH PAGINATION
    @GetMapping("/paginated")
    public Page<Restaurant> getAllRestaurantsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return restaurantService.getAllRestaurants(pageable);
    }
    
    // READ BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable Long id) {
        Optional<Restaurant> restaurant = restaurantService.getRestaurantById(id);
        return restaurant.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }
    
    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable Long id, @RequestBody Restaurant restaurantDetails) {
        Optional<Restaurant> optionalRestaurant = restaurantService.getRestaurantById(id);
        if (optionalRestaurant.isPresent()) {
            Restaurant restaurant = optionalRestaurant.get();
            restaurant.setName(restaurantDetails.getName());
            restaurant.setDescription(restaurantDetails.getDescription());
            restaurant.setAddress(restaurantDetails.getAddress());
            restaurant.setPhone(restaurantDetails.getPhone());
            
            Restaurant updatedRestaurant = restaurantService.updateRestaurant(restaurant);
            return ResponseEntity.ok(updatedRestaurant);
        }
        return ResponseEntity.notFound().build();
    }
    
    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRestaurant(@PathVariable Long id) {
        if (restaurantService.getRestaurantById(id).isPresent()) {
            restaurantService.deleteRestaurant(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    // GET RESTAURANTS BY OWNER
    @GetMapping("/owner/{ownerId}")
    public List<Restaurant> getRestaurantsByOwner(@PathVariable Long ownerId) {
        return restaurantService.getRestaurantsByOwner(ownerId);
    }
    
    // GET RESTAURANTS BY PROVINCE
    @GetMapping("/province/{provinceName}")
    public List<Restaurant> getRestaurantsByProvince(@PathVariable String provinceName) {
        return restaurantService.getRestaurantsByProvinceName(provinceName);
    }
    
    // SEARCH RESTAURANTS
    @GetMapping("/search/{searchTerm}")
    public List<Restaurant> searchRestaurants(@PathVariable String searchTerm) {
        return restaurantService.searchRestaurants(searchTerm);
    }
}