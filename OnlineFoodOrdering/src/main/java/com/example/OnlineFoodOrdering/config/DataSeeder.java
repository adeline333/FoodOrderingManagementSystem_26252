package com.example.OnlineFoodOrdering.config;

import com.example.OnlineFoodOrdering.entity.*;
import com.example.OnlineFoodOrdering.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

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
        if (restaurantRepository.count() > 0) {
            System.out.println("Restaurant data already exists. Skipping seeding...");
            return;
        }
        
        System.out.println("Starting restaurant and menu data seeding via SQL...");
        try {
            executeSeedSql();
            System.out.println("✓ Data seeding completed successfully!");
        } catch (Exception e) {
            System.err.println("Error during data seeding: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void executeSeedSql() throws Exception {
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
                } catch (Exception e) {
                    // Continue on error - might be duplicate key or other constraints
                    System.out.println("Note: " + e.getMessage());
                }
            }
        }
    }
    
//     // private void seedLocationData() {
//     //     // Create Rwandan Provinces
//     //     Province kigali = new Province("P1", "Kigali City");
//     //     Province southern = new Province("P2", "Southern Province");
//     //     Province western = new Province("P3", "Western Province");
//     //     Province northern = new Province("P4", "Northern Province");
//     //     Province eastern = new Province("P5", "Eastern Province");
        
//     //     provinceRepository.saveAll(Arrays.asList(kigali, southern, western, northern, eastern));
        
//     //     // Create Districts for Kigali
//     //     District gasabo = new District("D1", "Gasabo", kigali);
//     //     District kicukiro = new District("D2", "Kicukiro", kigali);
//     //     District nyarugenge = new District("D3", "Nyarugenge", kigali);
        
//     //     districtRepository.saveAll(Arrays.asList(gasabo, kicukiro, nyarugenge));
        
//     //     // Create Sectors for Gasabo
//     //     Sector remera = new Sector("S1", "Remera", gasabo);
//     //     Sector kacyiru = new Sector("S2", "Kacyiru", gasabo);
        
//     //     sectorRepository.saveAll(Arrays.asList(remera, kacyiru));
        
//     //     // Create Cells for Remera
//     //     Cell gishushu = new Cell("C1", "Gishushu", remera);
//     //     Cell nyarutarama = new Cell("C2", "Nyarutarama", remera);
        
//     //     cellRepository.saveAll(Arrays.asList(gishushu, nyarutarama));
        
//     //     // Create Villages for Gishushu
//     //     Village village1 = new Village("V1", "Gishushu Village 1", gishushu);
//     //     Village village2 = new Village("V2", "Gishushu Village 2", gishushu);
        
//     //     villageRepository.saveAll(Arrays.asList(village1, village2));
//     // }
    
//     // private void seedUsersAndRestaurants() {
//     //     // Get a village for users
//     //     Village village = villageRepository.findById(1L).orElseThrow();
        
//     //     // Create Users
//     //     User admin = new User("Admin", "User", "admin@food.com", "0781234567", "password", User.UserRole.ADMIN);
//     //     admin.setVillage(village);
        
//     //     User customer1 = new User("John", "Doe", "john@food.com", "0781111111", "password", User.UserRole.CUSTOMER);
//     //     customer1.setVillage(village);
        
//     //     User restaurantOwner = new User("Alice", "Restaurant", "alice@food.com", "0782222222", "password", User.UserRole.RESTAURANT_OWNER);
//     //     restaurantOwner.setVillage(village);
        
//     //     userRepository.saveAll(Arrays.asList(admin, customer1, restaurantOwner));
        
//     //     // Create Restaurant
//     //     Restaurant restaurant = new Restaurant("Kigali Food Hub", "Best local food in Kigali", "KN 123 St", "0783333333", restaurantOwner);
//     //     restaurant.setVillage(village);
        
//     //     restaurantRepository.save(restaurant);
//     // }
    
//     // private void seedMenuItemsAndOrders() {
//     //     // Get restaurant and customer
//     //     Restaurant restaurant = restaurantRepository.findById(1L).orElseThrow();
//     //     User customer = userRepository.findByEmail("john@food.com").orElseThrow();
        
//     //     // Create Menu Items
//     //     MenuItem pizza = new MenuItem("Pizza", "Delicious cheese pizza", 12000.0, MenuItem.FoodCategory.MAIN_COURSE, restaurant);
//     //     MenuItem burger = new MenuItem("Burger", "Beef burger with fries", 8000.0, MenuItem.FoodCategory.MAIN_COURSE, restaurant);
//     //     MenuItem juice = new MenuItem("Orange Juice", "Fresh orange juice", 2000.0, MenuItem.FoodCategory.BEVERAGE, restaurant);
        
//     //     menuItemRepository.saveAll(Arrays.asList(pizza, burger, juice));
        
//     //     // Create Order
//     //     Order order = new Order(customer, "KN 123 Street, Kigali");
//     //     order.addMenuItem(pizza);
//     //     order.addMenuItem(juice);
        
//     //     orderRepository.save(order);
//     // }
// }