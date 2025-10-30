package com.example.OnlineFoodOrdering.service;


import com.example.OnlineFoodOrdering.entity.MenuItem;
import com.example.OnlineFoodOrdering.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MenuItemService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    public MenuItem create(MenuItem item) { return menuItemRepository.save(item); }

    public List<MenuItem> findAll() { return menuItemRepository.findAll(); }

    public Page<MenuItem> findAll(Pageable pageable) { return menuItemRepository.findAll(pageable); }

    public Optional<MenuItem> findById(Long id) { return menuItemRepository.findById(id); }

    public Optional<MenuItem> findByName(String name) { return menuItemRepository.findByName(name); }

    public boolean existsByName(String name) { return menuItemRepository.existsByName(name); }

    public List<MenuItem> searchByName(String name) { return menuItemRepository.findByNameContainingIgnoreCase(name); }

    public List<MenuItem> findByCategory(MenuItem.FoodCategory category) { return menuItemRepository.findByCategory(category); }

    public Page<MenuItem> findByCategory(MenuItem.FoodCategory category, Pageable pageable) { return menuItemRepository.findByCategory(category, pageable); }

    public List<MenuItem> findByPriceBetween(Double min, Double max) { return menuItemRepository.findByPriceBetween(min, max); }

    public Page<MenuItem> findByPriceBetween(Double min, Double max, Pageable pageable) { return menuItemRepository.findByPriceBetween(min, max, pageable); }

    public MenuItem update(MenuItem item) { return menuItemRepository.save(item); }

    public void delete(Long id) { menuItemRepository.deleteById(id); }
}



