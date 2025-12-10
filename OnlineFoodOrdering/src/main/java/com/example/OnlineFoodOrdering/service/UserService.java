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
    
    // ========== CREATE ==========
    
    public User createUser(User user) {
        return userRepository.save(user);
    }
    
    // ========== READ ==========
    
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
    
    // ========== UPDATE ==========
    
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    // ========== DELETE ==========
    
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    // ========== LOCATION-BASED QUERIES ==========
    
    // By location ID
    public List<User> getUsersByLocation(Long locationId) {
        return userRepository.findByLocationId(locationId);
    }
    
    // By location code
    public List<User> getUsersByLocationCode(String locationCode) {
        return userRepository.findByLocationCode(locationCode);
    }
    
    // By location name
    public List<User> getUsersByLocationName(String locationName) {
        return userRepository.findByLocationName(locationName);
    }
    
    // By province
    public List<User> getUsersByProvinceId(Long provinceId) {
        return userRepository.findByProvinceId(provinceId);
    }
    
    public List<User> getUsersByProvinceCode(String provinceCode) {
        return userRepository.findByProvinceCode(provinceCode);
    }
    
    public List<User> getUsersByProvinceName(String provinceName) {
        return userRepository.findByProvinceName(provinceName);
    }
    
    // By district
    public List<User> getUsersByDistrictName(String districtName) {
        return userRepository.findByDistrictName(districtName);
    }
    
    // By sector
    public List<User> getUsersBySectorName(String sectorName) {
        return userRepository.findBySectorName(sectorName);
    }
    
    // ========== ROLE-BASED QUERIES ==========
    
    public List<User> getUsersByRole(User.UserRole role) {
        return userRepository.findByRole(role);
    }
    
    public Page<User> getUsersByRole(User.UserRole role, Pageable pageable) {
        return userRepository.findByRole(role, pageable);
    }
    
    // ========== VALIDATION ==========
    
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }
    
    public boolean emailExistsInProvince(String email, String provinceName) {
        return userRepository.existsByEmailAndProvinceName(email, provinceName);
    }
    
    // ========== SEARCH ==========
    
    public List<User> searchUsersByName(String name) {
        return userRepository.findByFirstNameContainingIgnoreCase(name);
    }
}