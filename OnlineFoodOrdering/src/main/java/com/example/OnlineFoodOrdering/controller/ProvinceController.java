package com.example.OnlineFoodOrdering.controller;

import com.example.OnlineFoodOrdering.entity.Province;
import com.example.OnlineFoodOrdering.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/provinces")
@CrossOrigin(origins = "*")
public class ProvinceController {
    
    @Autowired
    private LocationService locationService;
    
    // CREATE
    @PostMapping
    public Province createProvince(@RequestBody Province province) {
        return locationService.createProvince(province);
    }
    
    // READ ALL
    @GetMapping
    public List<Province> getAllProvinces() {
        return locationService.getAllProvinces();
    }
    
    // READ ALL WITH PAGINATION
    @GetMapping("/paginated")
    public Page<Province> getAllProvincesPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return locationService.getAllProvinces(pageable);
    }
    
    // READ BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Province> getProvinceById(@PathVariable Long id) {
        Optional<Province> province = locationService.getProvinceById(id);
        return province.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    // READ BY CODE
    @GetMapping("/code/{code}")
    public ResponseEntity<Province> getProvinceByCode(@PathVariable String code) {
        Optional<Province> province = locationService.getProvinceByCode(code);
        return province.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    // READ BY NAME
    @GetMapping("/name/{name}")
    public ResponseEntity<Province> getProvinceByName(@PathVariable String name) {
        Optional<Province> province = locationService.getProvinceByName(name);
        return province.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Province> updateProvince(@PathVariable Long id, @RequestBody Province provinceDetails) {
        Optional<Province> optionalProvince = locationService.getProvinceById(id);
        if (optionalProvince.isPresent()) {
            Province province = optionalProvince.get();
            province.setName(provinceDetails.getName());
            province.setCode(provinceDetails.getCode());
            Province updatedProvince = locationService.createProvince(province);
            return ResponseEntity.ok(updatedProvince);
        }
        return ResponseEntity.notFound().build();
    }
    
    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProvince(@PathVariable Long id) {
        if (locationService.getProvinceById(id).isPresent()) {
            locationService.deleteProvince(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}