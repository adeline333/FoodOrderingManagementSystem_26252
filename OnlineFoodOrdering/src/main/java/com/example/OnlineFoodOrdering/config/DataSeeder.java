package com.example.OnlineFoodOrdering.config;

import java.sql.Connection;
import java.sql.Statement;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.example.OnlineFoodOrdering.repository.RestaurantRepository;

@Component
@Order(2) // Run after LocationDataSeeder
public class DataSeeder implements CommandLineRunner {
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
    @Autowired
    private DataSource dataSource;
    
    @Override
    public void run(String... args) throws Exception {
        // Only seed if no restaurants exist
        try {
            long count = restaurantRepository.count();
            if (count > 0) {
                System.out.println("[DataSeeder] Restaurant data already exists. Skipping seeding...");
                return;
            }
            
            System.out.println("[DataSeeder] Starting restaurant and menu data seeding via SQL...");
            executeSeedSql();
            System.out.println("[DataSeeder] ✓ Data seeding completed successfully!");
        } catch (Exception e) {
            System.err.println("[DataSeeder ERROR] " + e.getMessage());
            e.printStackTrace();
            // Continue app startup despite seeding errors
        }
    }

    private void executeSeedSql() throws Exception {
        if (dataSource == null) {
            System.err.println("[DataSeeder ERROR] DataSource not injected!");
            return;
        }
        
        String[] sqlStatements = {
            // Users
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES " +
            "(7, 'Adeline', 'Tuyizere', 'adelinetuyizere333@gmail.com', '$2a$10$jlyMvveLS3QgMnmdF.RT6.XUwS3iDnMOX9l16U4vcy3sE15Gl2VYu', 'CUSTOMER', '+250787510679', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES " +
            "(9, 'Adele', 'Tuyizere', 'adelinetuyizere5@gmail.com', '$2a$10$r4n6Lx8hIbYOSGnLAXLnR.9V91/rgMS8HHWsvynQ0iMN7u.zyNqae', 'ADMIN', '+250787510679', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES " +
            "(10, 'philbert', 'Musasira', 'philbertmusasira3@gmail.com', '$2a$10$wiPRFYdzYnt859DWhYfmT.I0kbIh5wgLee06z2c3Kt/LQ2i.WQkKS', 'RESTAURANT_OWNER', '+250785637481', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES " +
            "(11, 'Divine', 'Muhayimana', 'divyaine086@gmail.com', '$2a$10$l2lkGfGhprhHEjhD0jbKN.ma8qq1QvF2KuZzDoZqIIV2rE6aVJ.9a', 'RESTAURANT_OWNER', '+250789534787', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES " +
            "(13, 'Fiston', 'Uza', 'youfistalline11@gmail.com', '$2a$10$6xUrj18kdX3vQAjy8snqWug.eZ0fmLKUJ98It5Z1D/6w3wMobEyKa', 'RESTAURANT_OWNER', '0785263279', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES " +
            "(14, 'lindah', 'Iriza', 'irizalindah46@gmail.com', '$2a$10$k5iuUBCUqAXG2yhxGTg.mO/7uwpPlh3i5UxiQgRDva0HYWiZB1dFO', 'CUSTOMER', '+250785467321', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            
            // Restaurants
            "INSERT INTO restaurants (id, name, description, address, phone, owner_id, location_id) VALUES " +
            "(2, 'Philbert''s Kitchen', 'Authentic African and International cuisine with a modern twist', 'KG 15 Ave, Kigali Heights, Kigali', '+250 788 111 222', 10, NULL) ON CONFLICT DO NOTHING",
            
            "INSERT INTO restaurants (id, name, description, address, phone, owner_id, location_id) VALUES " +
            "(3, 'Divine Delights', 'Fresh, healthy, and delicious meals made with love', 'KN 4 Ave, Nyarutarama, Kigali', '+250 788 333 444', 11, NULL) ON CONFLICT DO NOTHING",
            
            "INSERT INTO restaurants (id, name, description, address, phone, owner_id, location_id) VALUES " +
            "(6, 'Trust restaurant', 'Rise and Shine with food', '123 Kacyiru', '+250786547432', 13, NULL) ON CONFLICT DO NOTHING"
        };
        
        try (Connection conn = dataSource.getConnection(); Statement stmt = conn.createStatement()) {
            for (String sql : sqlStatements) {
                try {
                    stmt.execute(sql);
                    System.out.println("[DataSeeder] Executed: " + sql.substring(0, Math.min(50, sql.length())) + "...");
                } catch (Exception e) {
                    System.out.println("[DataSeeder WARNING] " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("[DataSeeder ERROR] Failed to execute seed SQL: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}