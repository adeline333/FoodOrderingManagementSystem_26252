package com.example.OnlineFoodOrdering.controller;

import com.example.OnlineFoodOrdering.entity.MenuItem;
import com.example.OnlineFoodOrdering.entity.Restaurant;
import com.example.OnlineFoodOrdering.service.MenuItemService;
import com.example.OnlineFoodOrdering.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/menu-items")
@CrossOrigin(origins = "*")
public class MenuItemController {

    @Autowired
    private MenuItemService menuItemService;

    @Autowired
    private RestaurantRepository restaurantRepository;

    // Create
    @PostMapping
    public ResponseEntity<MenuItem> create(@RequestBody MenuItem item) {
        // Ensure we have a valid restaurant reference
        if (item.getRestaurant() != null && item.getRestaurant().getId() != null) {
            Optional<Restaurant> restaurant = restaurantRepository.findById(item.getRestaurant().getId());
            if (restaurant.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            item.setRestaurant(restaurant.get());
        } else {
            return ResponseEntity.badRequest().build();
        }

        // Set default values if not provided
        if (item.getAvailable() == null) {
            item.setAvailable(true);
        }

        return ResponseEntity.ok(menuItemService.create(item));
    }

    // Read - All
    @GetMapping
    public List<MenuItem> all() { 
        return menuItemService.findAll(); 
    }

    @GetMapping("/paginated")
    public Page<MenuItem> paginated(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return menuItemService.findAll(pageable);
    }

    // Read - By ID
    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> byId(@PathVariable Long id) {
        Optional<MenuItem> item = menuItemService.findById(id);
        if (item.isPresent()) {
            return ResponseEntity.ok(item.get());
        }
        return ResponseEntity.notFound().build();
    }

    // Read - Search by Name
    @GetMapping("/search")
    public List<MenuItem> search(@RequestParam String name) { 
        return menuItemService.searchByName(name); 
    }

    // Read - Check if exists by Name
    @GetMapping("/exists")
    public boolean existsByName(@RequestParam String name) { 
        return menuItemService.existsByName(name); 
    }

    // Read - By Category
    @GetMapping("/category/{category}")
    public List<MenuItem> byCategory(@PathVariable MenuItem.FoodCategory category) { 
        return menuItemService.findByCategory(category); 
    }

    @GetMapping("/category/{category}/paginated")
    public Page<MenuItem> byCategoryPaginated(@PathVariable MenuItem.FoodCategory category,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        return menuItemService.findByCategory(category, PageRequest.of(page, size));
    }

    // Read - By Restaurant
    @GetMapping("/restaurant/{restaurantId}")
    public List<MenuItem> byRestaurant(@PathVariable Long restaurantId) {
        return menuItemService.findByRestaurantId(restaurantId);
    }

    // Read - By Price Range
    @GetMapping("/price-range")
    public List<MenuItem> byPriceRange(@RequestParam Double min, @RequestParam Double max) {
        return menuItemService.findByPriceBetween(min, max);
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> update(@PathVariable Long id, @RequestBody MenuItem updated) {
        Optional<MenuItem> existing = menuItemService.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        MenuItem item = existing.get();
        item.setName(updated.getName());
        item.setDescription(updated.getDescription());
        item.setPrice(updated.getPrice());
        item.setCategory(updated.getCategory());
        item.setImageUrl(updated.getImageUrl());
        if (updated.getAvailable() != null) {
            item.setAvailable(updated.getAvailable());
        }

        return ResponseEntity.ok(menuItemService.update(item));
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Optional<MenuItem> existing = menuItemService.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        menuItemService.delete(id);
        return ResponseEntity.ok().build();
    }
}