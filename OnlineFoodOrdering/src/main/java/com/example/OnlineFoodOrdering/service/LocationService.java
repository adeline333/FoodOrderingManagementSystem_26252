package com.example.OnlineFoodOrdering.service;

import com.example.OnlineFoodOrdering.entity.Location;
import com.example.OnlineFoodOrdering.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class LocationService {
    
    @Autowired
    private LocationRepository locationRepository;
    
    // ========== CREATE ==========
    
    public Location createLocation(Location location) {
        // Validate parent if provided
        if (location.getParent() != null && location.getParent().getId() != null) {
            Location parent = locationRepository.findById(location.getParent().getId())
                .orElseThrow(() -> new RuntimeException("Parent location not found with ID: " + location.getParent().getId()));
            location.setParent(parent);
        }
        
        // Validate code uniqueness
        if (locationRepository.existsByCode(location.getCode())) {
            throw new RuntimeException("Location with code '" + location.getCode() + "' already exists");
        }
        
        return locationRepository.save(location);
    }
    
    // ========== READ ==========
    
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }
    
    public Page<Location> getAllLocations(Pageable pageable) {
        return locationRepository.findAll(pageable);
    }
    
    public Optional<Location> getLocationById(Long id) {
        return locationRepository.findById(id);
    }
    
    public Location getLocationByIdOrThrow(Long id) {
        return locationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Location not found with ID: " + id));
    }
    
    public Optional<Location> getLocationByCode(String code) {
        return locationRepository.findByCode(code);
    }
    
    public Optional<Location> getLocationByName(String name) {
        return locationRepository.findByName(name);
    }
    
    public List<Location> searchLocations(String searchTerm) {
        return locationRepository.searchLocations(searchTerm);
    }
    
    // ========== BY TYPE ==========
    
    public List<Location> getLocationsByType(Location.LocationType type) {
        return locationRepository.findByType(type);
    }
    
    public Page<Location> getLocationsByType(Location.LocationType type, Pageable pageable) {
        return locationRepository.findByType(type, pageable);
    }
    
    // ========== PROVINCES ==========
    
    public List<Location> getAllProvinces() {
        return locationRepository.findAllProvinces();
    }
    
    public Location createProvince(String code, String name) {
        Location province = new Location(code, name, Location.LocationType.PROVINCE);
        return createLocation(province);
    }
    
    // ========== DISTRICTS ==========
    
    public List<Location> getDistrictsByProvince(Long provinceId) {
        return locationRepository.findDistrictsByProvinceId(provinceId);
    }
    
    public Location createDistrict(String code, String name, Long provinceId) {
        Location province = getLocationByIdOrThrow(provinceId);
        if (province.getType() != Location.LocationType.PROVINCE) {
            throw new RuntimeException("Parent must be a PROVINCE");
        }
        Location district = new Location(code, name, Location.LocationType.DISTRICT, province);
        return createLocation(district);
    }
    
    // ========== SECTORS ==========
    
    public List<Location> getSectorsByDistrict(Long districtId) {
        return locationRepository.findSectorsByDistrictId(districtId);
    }
    
    public Location createSector(String code, String name, Long districtId) {
        Location district = getLocationByIdOrThrow(districtId);
        if (district.getType() != Location.LocationType.DISTRICT) {
            throw new RuntimeException("Parent must be a DISTRICT");
        }
        Location sector = new Location(code, name, Location.LocationType.SECTOR, district);
        return createLocation(sector);
    }
    
    // ========== CELLS ==========
    
    public List<Location> getCellsBySector(Long sectorId) {
        return locationRepository.findCellsBySectorId(sectorId);
    }
    
    public Location createCell(String code, String name, Long sectorId) {
        Location sector = getLocationByIdOrThrow(sectorId);
        // 🐛 BUG FIX: Changed from Location.LocationType.CELL to Location.LocationType.SECTOR
        if (sector.getType() != Location.LocationType.SECTOR) {
            throw new RuntimeException("Parent must be a SECTOR");
        }
        Location cell = new Location(code, name, Location.LocationType.CELL, sector);
        return createLocation(cell);
    }
    
    // ========== VILLAGES ==========
    
    public List<Location> getVillagesByCell(Long cellId) {
        return locationRepository.findVillagesByCellId(cellId);
    }
    
    public Location createVillage(String code, String name, Long cellId) {
        Location cell = getLocationByIdOrThrow(cellId);
        if (cell.getType() != Location.LocationType.CELL) {
            throw new RuntimeException("Parent must be a CELL");
        }
        Location village = new Location(code, name, Location.LocationType.VILLAGE, cell);
        return createLocation(village);
    }
    
    // ========== HIERARCHY ==========
    
    public List<Location> getChildren(Long parentId) {
        return locationRepository.findByParentIdOrderByNameAsc(parentId);
    }
    
    public Location getProvince(Long locationId) {
        return locationRepository.findProvinceByLocationId(locationId);
    }
    
    public List<Location> getAllInProvince(Long provinceId) {
        return locationRepository.findAllInProvince(provinceId);
    }
    
    // ========== UPDATE ==========
    
    public Location updateLocation(Long id, Location updatedLocation) {
        Location location = getLocationByIdOrThrow(id);
        
        location.setName(updatedLocation.getName());
        location.setCode(updatedLocation.getCode());
        
        // Update parent if provided
        if (updatedLocation.getParent() != null && updatedLocation.getParent().getId() != null) {
            Location parent = getLocationByIdOrThrow(updatedLocation.getParent().getId());
            location.setParent(parent);
        }
        
        return locationRepository.save(location);
    }
    
    // ========== DELETE ==========
    
    public void deleteLocation(Long id) {
        if (!locationRepository.existsById(id)) {
            throw new RuntimeException("Location not found with ID: " + id);
        }
        
        // Check if location has children
        Long childCount = locationRepository.countByParentId(id);
        if (childCount > 0) {
            throw new RuntimeException("Cannot delete location with children. Delete children first.");
        }
        
        locationRepository.deleteById(id);
    }
    
    // ========== STATISTICS ==========
    
    public Long countChildren(Long parentId) {
        return locationRepository.countByParentId(parentId);
    }
    
    public boolean existsByCode(String code) {
        return locationRepository.existsByCode(code);
    }
}