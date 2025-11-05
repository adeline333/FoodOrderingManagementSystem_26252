
package com.example.OnlineFoodOrdering.controller;

import com.example.OnlineFoodOrdering.entity.Sector;
import com.example.OnlineFoodOrdering.service.SectorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sectors")
@CrossOrigin(origins = "*")
public class SectorController {

    @Autowired
    private SectorService sectorService;

    // ✅ Create sector
    @PostMapping
    public ResponseEntity<Sector> createSector(@RequestBody Sector sector) {
        return ResponseEntity.ok(sectorService.createSector(sector));
    }

    // ✅ Get all sectors
    @GetMapping
    public ResponseEntity<List<Sector>> getAllSectors() {
        return ResponseEntity.ok(sectorService.getAllSectors());
    }

    // ✅ Get sector by ID
    @GetMapping("/{id}")
    public ResponseEntity<Sector> getSectorById(@PathVariable Long id) {
        return ResponseEntity.ok(sectorService.getSectorById(id));
    }

    // ✅ Get sector by code
    @GetMapping("/by-code/{code}")
    public ResponseEntity<Sector> getSectorByCode(@PathVariable String code) {
        return ResponseEntity.ok(sectorService.getSectorByCode(code));
    }

    // ✅ Get sectors by district ID
    @GetMapping("/by-district/{districtId}")
    public ResponseEntity<List<Sector>> getSectorsByDistrict(@PathVariable Long districtId) {
        return ResponseEntity.ok(sectorService.getSectorsByDistrict(districtId));
    }

    // ✅ Get sectors by district code
    @GetMapping("/by-district-code/{districtCode}")
    public ResponseEntity<List<Sector>> getSectorsByDistrictCode(@PathVariable String districtCode) {
        return ResponseEntity.ok(sectorService.getSectorsByDistrictCode(districtCode));
    }

    // ✅ Get sectors by province name
    @GetMapping("/by-province")
    public ResponseEntity<List<Sector>> getSectorsByProvinceName(@RequestParam String name) {
        return ResponseEntity.ok(sectorService.getSectorsByProvinceName(name));
    }

    // ✅ Update sector
    @PutMapping("/{id}")
    public ResponseEntity<Sector> updateSector(@PathVariable Long id, @RequestBody Sector sector) {
        return ResponseEntity.ok(sectorService.updateSector(id, sector));
    }

    // ✅ Delete sector
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSector(@PathVariable Long id) {
        sectorService.deleteSector(id);
        return ResponseEntity.ok("Sector deleted successfully");
    }

    // ✅ Count sectors by district
    @GetMapping("/count-by-district/{districtId}")
    public ResponseEntity<Long> countByDistrict(@PathVariable Long districtId) {
        return ResponseEntity.ok(sectorService.countByDistrict(districtId));
    }
}
