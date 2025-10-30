package com.example.OnlineFoodOrdering.controller;



import com.example.OnlineFoodOrdering.entity.District;
import com.example.OnlineFoodOrdering.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/districts")
@CrossOrigin(origins = "*")
public class DistrictController {
    
    @Autowired
    private LocationService locationService;
    
    // CREATE
    @PostMapping
    public District createDistrict(@RequestBody District district) {
        return locationService.createDistrict(district);
    }
    
    // GET DISTRICTS BY PROVINCE ID
    @GetMapping("/province/{provinceId}")
    public List<District> getDistrictsByProvince(@PathVariable Long provinceId) {
        return locationService.getDistrictsByProvince(provinceId);
    }
    
    // GET DISTRICTS BY PROVINCE NAME
    @GetMapping("/province/name/{provinceName}")
    public List<District> getDistrictsByProvinceName(@PathVariable String provinceName) {
        return locationService.getDistrictsByProvinceName(provinceName);
    }
}