package com.example.OnlineFoodOrdering.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.OnlineFoodOrdering.entity.Location;
import com.example.OnlineFoodOrdering.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Order(1) // Run early in the startup process
public class LocationDataSeeder implements CommandLineRunner {

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if database is empty
        if (locationRepository.count() > 0) {
            System.out.println("Location data already exists. Skipping seeding...");
            return;
        }

        System.out.println("Starting Rwanda location data seeding...");
        
        try {
            // Load data from GitHub URL
            URL url = new URL("https://raw.githubusercontent.com/jnkindi/rwanda-locations-json/master/locations.json");
            InputStream inputStream = url.openStream();
            
            List<LocationEntry> entries = objectMapper.readValue(inputStream, 
                new TypeReference<List<LocationEntry>>() {});

            // Maps to avoid duplicates and track relationships
            Map<String, Location> provinceMap = new HashMap<>();
            Map<String, Location> districtMap = new HashMap<>();
            Map<String, Location> sectorMap = new HashMap<>();
            Map<String, Location> cellMap = new HashMap<>();

            int totalProcessed = 0;
            
            for (LocationEntry entry : entries) {
                // Create Province
                String provinceKey = entry.province_code.toString();
                Location province = provinceMap.computeIfAbsent(provinceKey, code -> {
                    Location p = new Location(code, entry.province_name, Location.LocationType.PROVINCE);
                    return locationRepository.save(p);
                });

                // Create District
                String districtKey = entry.district_code.toString();
                Location district = districtMap.computeIfAbsent(districtKey, code -> {
                    Location d = new Location(code, entry.district_name, Location.LocationType.DISTRICT, province);
                    return locationRepository.save(d);
                });

                // Create Sector
                String sectorKey = entry.sector_code;
                Location sector = sectorMap.computeIfAbsent(sectorKey, code -> {
                    Location s = new Location(code, entry.sector_name, Location.LocationType.SECTOR, district);
                    return locationRepository.save(s);
                });

                // Create Cell
                String cellKey = entry.cell_code.toString();
                Location cell = cellMap.computeIfAbsent(cellKey, code -> {
                    Location c = new Location(code, entry.cell_name, Location.LocationType.CELL, sector);
                    return locationRepository.save(c);
                });

                // Create Village
                String villageKey = entry.village_code.toString();
                Location village = new Location(villageKey, entry.village_name, Location.LocationType.VILLAGE, cell);
                locationRepository.save(village);
                
                totalProcessed++;
                
                // Progress indicator
                if (totalProcessed % 1000 == 0) {
                    System.out.println("Processed " + totalProcessed + " locations...");
                }
            }

            System.out.println("✅ Rwanda location data seeded successfully!");
            System.out.println("📊 Statistics:");
            System.out.println("   Provinces: " + provinceMap.size());
            System.out.println("   Districts: " + districtMap.size());
            System.out.println("   Sectors: " + sectorMap.size());
            System.out.println("   Cells: " + cellMap.size());
            System.out.println("   Villages: " + (totalProcessed - cellMap.size()));
            System.out.println("   Total locations: " + locationRepository.count());

        } catch (Exception e) {
            System.err.println("❌ Error seeding location data: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Inner class to match JSON structure from GitHub
    private static class LocationEntry {
        public String id;
        public String country_code;
        public String country_name;
        public Integer province_code;
        public String province_name;
        public Integer district_code;
        public String district_name;
        public String sector_code;
        public String sector_name;
        public Integer cell_code;
        public String cell_name;
        public Long village_code;
        public String village_name;
    }
}