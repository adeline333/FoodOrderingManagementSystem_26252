package com.example.OnlineFoodOrdering.service;

import com.example.OnlineFoodOrdering.entity.Cell;
import com.example.OnlineFoodOrdering.entity.Village;
import com.example.OnlineFoodOrdering.repository.CellRepository;
import com.example.OnlineFoodOrdering.repository.VillageRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class VillageService {

    @Autowired
    private VillageRepository villageRepository;

    @Autowired
    private CellRepository cellRepository;

    // ✅ Create a new village
    public Village createVillage(Village village) {
        if (villageRepository.existsByCode(village.getCode())) {
            throw new RuntimeException("Village with code '" + village.getCode() + "' already exists");
        }
        if (villageRepository.existsByName(village.getName())) {
            throw new RuntimeException("Village with name '" + village.getName() + "' already exists");
        }
        return villageRepository.save(village);
    }

    // ✅ Get all villages
    public List<Village> getAllVillages() {
        return villageRepository.findAll();
    }

    // ✅ Get village by ID
    public Village getVillageById(Long id) {
        return villageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Village not found with ID: " + id));
    }

    // ✅ Get village by code
    public Village getVillageByCode(String code) {
        return villageRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Village not found with code: " + code));
    }

    // ✅ Get villages by cell ID
    public List<Village> getVillagesByCell(Long cellId) {
        return villageRepository.findByCellId(cellId);
    }

    // ✅ Get villages by cell code
    public List<Village> getVillagesByCellCode(String cellCode) {
        return villageRepository.findByCellCode(cellCode);
    }

    // ✅ Get villages by sector name
    public List<Village> getVillagesBySectorName(String sectorName) {
        return villageRepository.findByCellSectorName(sectorName);
    }

    // ✅ Get villages by district name
    public List<Village> getVillagesByDistrictName(String districtName) {
        return villageRepository.findByCellSectorDistrictName(districtName);
    }

    // ✅ Get villages by province name
    public List<Village> getVillagesByProvinceName(String provinceName) {
        return villageRepository.findByCellSectorDistrictProvinceName(provinceName);
    }

    // ✅ Update village
    public Village updateVillage(Long id, Village updatedVillage) {
        Village village = getVillageById(id);
        village.setName(updatedVillage.getName());
        village.setCode(updatedVillage.getCode());
        village.setCell(updatedVillage.getCell());
        return villageRepository.save(village);
    }

    // ✅ Delete village
    public void deleteVillage(Long id) {
        if (!villageRepository.existsById(id)) {
            throw new RuntimeException("Village not found with ID: " + id);
        }
        villageRepository.deleteById(id);
    }

    // ✅ Count villages by province ID
    public Long countByProvince(Long provinceId) {
        return villageRepository.countByProvinceId(provinceId);
    }
}
