package com.example.OnlineFoodOrdering.service;




import com.example.OnlineFoodOrdering.entity.*;
import com.example.OnlineFoodOrdering.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LocationService {
    
    @Autowired
    private ProvinceRepository provinceRepository;
    
    @Autowired
    private DistrictRepository districtRepository;
    
    @Autowired
    private SectorRepository sectorRepository;
    
    @Autowired
    private CellRepository cellRepository;
    
    @Autowired
    private VillageRepository villageRepository;
    
    // Province methods
    public Province createProvince(Province province) {
        return provinceRepository.save(province);
    }
    
    public List<Province> getAllProvinces() {
        return provinceRepository.findAll();
    }
    
    public Page<Province> getAllProvinces(Pageable pageable) {
        return provinceRepository.findAll(pageable);
    }
    
    public Optional<Province> getProvinceById(Long id) {
        return provinceRepository.findById(id);
    }
    
    public Optional<Province> getProvinceByCode(String code) {
        return provinceRepository.findByCode(code);
    }
    
    public Optional<Province> getProvinceByName(String name) {
        return provinceRepository.findByName(name);
    }
    
    public void deleteProvince(Long id) {
        provinceRepository.deleteById(id);
    }
    
    // District methods
    public District createDistrict(District district) {
        return districtRepository.save(district);
    }
    
    public List<District> getDistrictsByProvince(Long provinceId) {
        return districtRepository.findByProvinceId(provinceId);
    }
    
    public List<District> getDistrictsByProvinceName(String provinceName) {
        return districtRepository.findByProvinceName(provinceName);
    }
    
    // Sector methods
    public List<Sector> getSectorsByDistrict(Long districtId) {
        return sectorRepository.findByDistrictId(districtId);
    }
    
    public List<Sector> getAllSectors() {
        return sectorRepository.findAll();
    }
    
    // Cell methods
    public List<Cell> getCellsBySector(Long sectorId) {
        return cellRepository.findBySectorId(sectorId);
    }
    
    public List<Cell> getAllCells() {
        return cellRepository.findAll();
    }
    
    // Village methods
    public List<Village> getVillagesByCell(Long cellId) {
        return villageRepository.findByCellId(cellId);
    }
    
    public List<Village> getAllVillages() {
        return villageRepository.findAll();
    }
    
    // REQUIRED: Get villages by province
    public List<Village> getVillagesByProvinceName(String provinceName) {
        return villageRepository.findByProvinceName(provinceName);
    }
    
    public List<Village> getVillagesByProvinceCode(String provinceCode) {
        return villageRepository.findByProvinceCode(provinceCode);
    }
}