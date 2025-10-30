package com.example.OnlineFoodOrdering.controller;


import com.example.OnlineFoodOrdering.entity.MenuItem;
import com.example.OnlineFoodOrdering.service.MenuItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/menu-items")
@CrossOrigin(origins = "*")
public class MenuItemController {

    @Autowired
    private MenuItemService menuItemService;

    @PostMapping
    public MenuItem create(@RequestBody MenuItem item) { return menuItemService.create(item); }

    @GetMapping
    public List<MenuItem> all() { return menuItemService.findAll(); }

    @GetMapping("/paginated")
    public Page<MenuItem> paginated(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return menuItemService.findAll(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> byId(@PathVariable Long id) {
        Optional<MenuItem> item = menuItemService.findById(id);
        return item.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<MenuItem> search(@RequestParam String name) { return menuItemService.searchByName(name); }

    @GetMapping("/exists")
    public boolean existsByName(@RequestParam String name) { return menuItemService.existsByName(name); }

    @GetMapping("/category/{category}")
    public List<MenuItem> byCategory(@PathVariable MenuItem.FoodCategory category) { return menuItemService.findByCategory(category); }

    @GetMapping("/category/{category}/paginated")
    public Page<MenuItem> byCategoryPaginated(@PathVariable MenuItem.FoodCategory category,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        return menuItemService.findByCategory(category, PageRequest.of(page, size));
    }

    @GetMapping("/price-range")
    public List<MenuItem> byPriceRange(@RequestParam Double min, @RequestParam Double max) {
        return menuItemService.findByPriceBetween(min, max);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> update(@PathVariable Long id, @RequestBody MenuItem updated) {
        Optional<MenuItem> existing = menuItemService.findById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        MenuItem item = existing.get();
        item.setName(updated.getName());
        item.setDescription(updated.getDescription());
        item.setPrice(updated.getPrice());
        item.setCategory(updated.getCategory());
        return ResponseEntity.ok(menuItemService.update(item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Optional<MenuItem> existing = menuItemService.findById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        menuItemService.delete(id);
        return ResponseEntity.ok().build();
    }
}



