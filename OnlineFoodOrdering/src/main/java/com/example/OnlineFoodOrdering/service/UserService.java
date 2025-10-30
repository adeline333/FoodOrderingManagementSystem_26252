package com.example.OnlineFoodOrdering.service;


import com.example.OnlineFoodOrdering.entity.User;
import com.example.OnlineFoodOrdering.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // CREATE
    public User createUser(User user) {
        return userRepository.save(user);
    }
    
    // READ
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    // UPDATE
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    // DELETE
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    // REQUIRED: Get users by province
    public List<User> getUsersByProvinceCode(String provinceCode) {
        return userRepository.findByProvinceCode(provinceCode);
    }
    
    public List<User> getUsersByProvinceName(String provinceName) {
        return userRepository.findByProvinceName(provinceName);
    }
    
    // Additional business methods
    public List<User> getUsersByRole(User.UserRole role) {
        return userRepository.findByRole(role);
    }
    
    public Page<User> getUsersByRole(User.UserRole role, Pageable pageable) {
        return userRepository.findByRole(role, pageable);
    }
    
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }
    
    public List<User> searchUsersByName(String name) {
        return userRepository.findByFirstNameContainingIgnoreCase(name);
    }
}