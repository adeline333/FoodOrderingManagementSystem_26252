package com.example.OnlineFoodOrdering.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.OnlineFoodOrdering.entity.Village;
import com.example.OnlineFoodOrdering.service.VillageService;

@RestController
@RequestMapping("/api/villages")
@CrossOrigin(origins = "*")
public class VillageController {

    @Autowired
    private VillageService villageService;

    // ✅ Create a village using nested JSON
 @PostMapping
public ResponseEntity<Village> createVillage(@RequestBody Village village) {
    if (village.getCell() == null || village.getCell().getId() == null) {
        throw new IllegalArgumentException("Cell ID must be provided");
    }
    return ResponseEntity.ok(villageService.createVillage(village)); // only 1 argument
}

    // ✅ Get all villages
    @GetMapping
    public ResponseEntity<List<Village>> getAllVillages() {
        return ResponseEntity.ok(villageService.getAllVillages());
    }

    // ✅ Get village by ID
    @GetMapping("/{id}")
    public ResponseEntity<Village> getVillageById(@PathVariable Long id) {
        return ResponseEntity.ok(villageService.getVillageById(id));
    }

    // ✅ Get village by code
    @GetMapping("/by-code/{code}")
    public ResponseEntity<Village> getVillageByCode(@PathVariable String code) {
        return ResponseEntity.ok(villageService.getVillageByCode(code));
    }

    // ✅ Get villages by cell ID
    @GetMapping("/by-cell/{cellId}")
    public ResponseEntity<List<Village>> getVillagesByCell(@PathVariable Long cellId) {
        return ResponseEntity.ok(villageService.getVillagesByCell(cellId));
    }

    // ✅ Get villages by sector name
    @GetMapping("/by-sector")
    public ResponseEntity<List<Village>> getVillagesBySectorName(@RequestParam String name) {
        return ResponseEntity.ok(villageService.getVillagesBySectorName(name));
    }

    // ✅ Get villages by district name
    @GetMapping("/by-district")
    public ResponseEntity<List<Village>> getVillagesByDistrictName(@RequestParam String name) {
        return ResponseEntity.ok(villageService.getVillagesByDistrictName(name));
    }

    // ✅ Get villages by province name
    @GetMapping("/by-province")
    public ResponseEntity<List<Village>> getVillagesByProvinceName(@RequestParam String name) {
        return ResponseEntity.ok(villageService.getVillagesByProvinceName(name));
    }

    // ✅ Update village
    @PutMapping("/{id}")
public ResponseEntity<Village> updateVillage(@PathVariable Long id, @RequestBody Village updatedVillage) {
    if (updatedVillage.getCell() == null || updatedVillage.getCell().getId() == null) {
        throw new IllegalArgumentException("Cell ID must be provided");
    }
    return ResponseEntity.ok(villageService.updateVillage(id, updatedVillage)); // only 2 params
}

    // ✅ Delete village
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteVillage(@PathVariable Long id) {
        villageService.deleteVillage(id);
        return ResponseEntity.ok("Village deleted successfully");
    }
}
