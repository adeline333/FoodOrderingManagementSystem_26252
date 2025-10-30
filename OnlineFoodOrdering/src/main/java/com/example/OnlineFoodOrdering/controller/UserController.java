package com.example.OnlineFoodOrdering.controller;


import com.example.OnlineFoodOrdering.entity.User;
import com.example.OnlineFoodOrdering.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // CREATE
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }
    
    // READ ALL
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }
    
    // READ ALL WITH PAGINATION AND SORTING
    @GetMapping("/paginated")
    public Page<User> getAllUsersPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        Sort sort = sortDirection.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return userService.getAllUsers(pageable);
    }
    
    // READ BY ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    // READ BY EMAIL
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.getUserByEmail(email);
        return user.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        Optional<User> optionalUser = userService.getUserById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setFirstName(userDetails.getFirstName());
            user.setLastName(userDetails.getLastName());
            user.setEmail(userDetails.getEmail());
            user.setPhone(userDetails.getPhone());
            user.setRole(userDetails.getRole());
            user.setVillage(userDetails.getVillage());
            
            User updatedUser = userService.updateUser(user);
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.notFound().build();
    }
    
    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (userService.getUserById(id).isPresent()) {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    // REQUIRED: GET USERS BY PROVINCE CODE
    @GetMapping("/province/code/{provinceCode}")
    public List<User> getUsersByProvinceCode(@PathVariable String provinceCode) {
        return userService.getUsersByProvinceCode(provinceCode);
    }
    
    // REQUIRED: GET USERS BY PROVINCE NAME
    @GetMapping("/province/name/{provinceName}")
    public List<User> getUsersByProvinceName(@PathVariable String provinceName) {
        return userService.getUsersByProvinceName(provinceName);
    }
    
    // GET USERS BY ROLE
    @GetMapping("/role/{role}")
    public List<User> getUsersByRole(@PathVariable User.UserRole role) {
        return userService.getUsersByRole(role);
    }
    
    // GET USERS BY ROLE WITH PAGINATION
    @GetMapping("/role/{role}/paginated")
    public Page<User> getUsersByRolePaginated(
            @PathVariable User.UserRole role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userService.getUsersByRole(role, pageable);
    }
    
    // CHECK IF EMAIL EXISTS
    @GetMapping("/exists/email/{email}")
    public boolean checkEmailExists(@PathVariable String email) {
        return userService.emailExists(email);
    }
    
    // SEARCH USERS BY NAME
    @GetMapping("/search/{name}")
    public List<User> searchUsersByName(@PathVariable String name) {
        return userService.searchUsersByName(name);
    }
}
