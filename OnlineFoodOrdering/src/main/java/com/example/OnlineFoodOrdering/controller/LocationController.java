package com.example.OnlineFoodOrdering.controller;

import com.example.OnlineFoodOrdering.entity.Location;
import com.example.OnlineFoodOrdering.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "*")
public class LocationController {
    
    @Autowired
    private LocationService locationService;
    
    // ========== GENERIC CRUD ==========
    
    @PostMapping
    public ResponseEntity<Location> createLocation(@RequestBody Location location) {
        return ResponseEntity.ok(locationService.createLocation(location));
    }
    
    @GetMapping
    public ResponseEntity<List<Location>> getAllLocations() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }
    
    @GetMapping("/paginated")
    public ResponseEntity<Page<Location>> getAllLocationsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(locationService.getAllLocations(pageable));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable Long id) {
        return locationService.getLocationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/code/{code}")
    public ResponseEntity<Location> getLocationByCode(@PathVariable String code) {
        return locationService.getLocationByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Location>> searchLocations(@RequestParam String term) {
        return ResponseEntity.ok(locationService.searchLocations(term));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Location> updateLocation(
            @PathVariable Long id,
            @RequestBody Location location) {
        return ResponseEntity.ok(locationService.updateLocation(id, location));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
        return ResponseEntity.ok("Location deleted successfully");
    }
    
    // ========== BY TYPE ==========
    
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Location>> getLocationsByType(@PathVariable Location.LocationType type) {
        return ResponseEntity.ok(locationService.getLocationsByType(type));
    }
    
    @GetMapping("/type/{type}/paginated")
    public ResponseEntity<Page<Location>> getLocationsByTypePaginated(
            @PathVariable Location.LocationType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(locationService.getLocationsByType(type, pageable));
    }
    
    // ========== PROVINCES ==========
    
    @GetMapping("/provinces")
    public ResponseEntity<List<Location>> getAllProvinces() {
        return ResponseEntity.ok(locationService.getAllProvinces());
    }
    
    @PostMapping("/provinces")
    public ResponseEntity<Location> createProvince(@RequestBody Location province) {
        province.setType(Location.LocationType.PROVINCE);
        province.setParent(null);
        return ResponseEntity.ok(locationService.createLocation(province));
    }
    
    // ========== DISTRICTS ==========
    
    @GetMapping("/provinces/{provinceId}/districts")
    public ResponseEntity<List<Location>> getDistrictsByProvince(@PathVariable Long provinceId) {
        return ResponseEntity.ok(locationService.getDistrictsByProvince(provinceId));
    }
    
    @PostMapping("/provinces/{provinceId}/districts")
    public ResponseEntity<Location> createDistrict(
            @PathVariable Long provinceId,
            @RequestBody Location district) {
        return ResponseEntity.ok(locationService.createDistrict(
                district.getCode(),
                district.getName(),
                provinceId));
    }
    
    // ========== SECTORS ==========
    
    @GetMapping("/districts/{districtId}/sectors")
    public ResponseEntity<List<Location>> getSectorsByDistrict(@PathVariable Long districtId) {
        return ResponseEntity.ok(locationService.getSectorsByDistrict(districtId));
    }
    
    @PostMapping("/districts/{districtId}/sectors")
    public ResponseEntity<Location> createSector(
            @PathVariable Long districtId,
            @RequestBody Location sector) {
        return ResponseEntity.ok(locationService.createSector(
                sector.getCode(),
                sector.getName(),
                districtId));
    }
    
    // ========== CELLS ==========
    
    @GetMapping("/sectors/{sectorId}/cells")
    public ResponseEntity<List<Location>> getCellsBySector(@PathVariable Long sectorId) {
        return ResponseEntity.ok(locationService.getCellsBySector(sectorId));
    }
    
    @PostMapping("/sectors/{sectorId}/cells")
    public ResponseEntity<Location> createCell(
            @PathVariable Long sectorId,
            @RequestBody Location cell) {
        return ResponseEntity.ok(locationService.createCell(
                cell.getCode(),
                cell.getName(),
                sectorId));
    }
    
    // ========== VILLAGES ==========
    
    @GetMapping("/cells/{cellId}/villages")
    public ResponseEntity<List<Location>> getVillagesByCell(@PathVariable Long cellId) {
        return ResponseEntity.ok(locationService.getVillagesByCell(cellId));
    }
    
    @PostMapping("/cells/{cellId}/villages")
    public ResponseEntity<Location> createVillage(
            @PathVariable Long cellId,
            @RequestBody Location village) {
        return ResponseEntity.ok(locationService.createVillage(
                village.getCode(),
                village.getName(),
                cellId));
    }
    
    // ========== HIERARCHY ==========
    
    @GetMapping("/{id}/children")
    public ResponseEntity<List<Location>> getChildren(@PathVariable Long id) {
        return ResponseEntity.ok(locationService.getChildren(id));
    }
    
    @GetMapping("/{id}/province")
    public ResponseEntity<Location> getProvince(@PathVariable Long id) {
        return ResponseEntity.ok(locationService.getProvince(id));
    }
    
    @GetMapping("/provinces/{provinceId}/all")
    public ResponseEntity<List<Location>> getAllInProvince(@PathVariable Long provinceId) {
        return ResponseEntity.ok(locationService.getAllInProvince(provinceId));
    }
    
    // ========== STATISTICS ==========
    
    @GetMapping("/{id}/count-children")
    public ResponseEntity<Long> countChildren(@PathVariable Long id) {
        return ResponseEntity.ok(locationService.countChildren(id));
    }
    
    @GetMapping("/exists/code/{code}")
    public ResponseEntity<Boolean> existsByCode(@PathVariable String code) {
        return ResponseEntity.ok(locationService.existsByCode(code));
    }
}