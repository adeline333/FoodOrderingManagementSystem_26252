package com.example.OnlineFoodOrdering.service;

import com.example.OnlineFoodOrdering.entity.District;
import com.example.OnlineFoodOrdering.entity.Sector;
import com.example.OnlineFoodOrdering.repository.DistrictRepository;
import com.example.OnlineFoodOrdering.repository.SectorRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class SectorService {

    @Autowired
    private SectorRepository sectorRepository;

    @Autowired
    private DistrictRepository districtRepository;

    // ✅ Create a new sector
    public Sector createSector(Sector sector) {
        if (sectorRepository.existsByCode(sector.getCode())) {
            throw new RuntimeException("Sector with code '" + sector.getCode() + "' already exists");
        }
        if (sectorRepository.existsByName(sector.getName())) {
            throw new RuntimeException("Sector with name '" + sector.getName() + "' already exists");
        }
        return sectorRepository.save(sector);
    }

    // ✅ Get all sectors
    public List<Sector> getAllSectors() {
        return sectorRepository.findAll();
    }

    // ✅ Get sector by ID
    public Sector getSectorById(Long id) {
        return sectorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sector not found with ID: " + id));
    }

    // ✅ Get sector by code
    public Sector getSectorByCode(String code) {
        return sectorRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Sector not found with code: " + code));
    }

    // ✅ Get sectors by district ID
    public List<Sector> getSectorsByDistrict(Long districtId) {
        return sectorRepository.findByDistrictId(districtId);
    }

    // ✅ Get sectors by district code
    public List<Sector> getSectorsByDistrictCode(String districtCode) {
        return sectorRepository.findByDistrictCode(districtCode);
    }

    // ✅ Get sectors by province name
    public List<Sector> getSectorsByProvinceName(String provinceName) {
        return sectorRepository.findByDistrictProvinceName(provinceName);
    }

    // ✅ Update sector
    public Sector updateSector(Long id, Sector updatedSector) {
        Sector sector = getSectorById(id);
        sector.setName(updatedSector.getName());
        sector.setCode(updatedSector.getCode());
        sector.setDistrict(updatedSector.getDistrict());
        return sectorRepository.save(sector);
    }

    // ✅ Delete sector
    public void deleteSector(Long id) {
        if (!sectorRepository.existsById(id)) {
            throw new RuntimeException("Sector not found with ID: " + id);
        }
        sectorRepository.deleteById(id);
    }

    // ✅ Count sectors by district
    public Long countByDistrict(Long districtId) {
        return sectorRepository.countByDistrictId(districtId);
    }
}
