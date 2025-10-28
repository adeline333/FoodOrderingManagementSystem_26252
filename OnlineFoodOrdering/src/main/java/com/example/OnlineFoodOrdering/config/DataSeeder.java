// package com.example.OnlineFoodOrdering.config;


// import com.example.OnlineFoodOrdering.entity.*;
// import com.example.OnlineFoodOrdering.repository.*;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.CommandLineRunner;
// import org.springframework.stereotype.Component;

// import java.util.Arrays;

// @Component
// public class DataSeeder implements CommandLineRunner {
    
//     // @Autowired
//     // private ProvinceRepository provinceRepository;
    
//     // @Autowired
//     // private DistrictRepository districtRepository;
    
//     // @Autowired
//     // private SectorRepository sectorRepository;
    
//     // @Autowired
//     // private CellRepository cellRepository;
    
//     // @Autowired
//     // private VillageRepository villageRepository;
    
//     // @Autowired
//     // private UserRepository userRepository;
    
//     // @Autowired
//     // private RestaurantRepository restaurantRepository;
    
//     // @Autowired
//     // private MenuItemRepository menuItemRepository;
    
//     // @Autowired
//     // private OrderRepository orderRepository;
    
//     // @Override
//     // public void run(String... args) throws Exception {
//     //     // Only seed if no data exists
//     //     if (provinceRepository.count() == 0) {
//     //         seedLocationData();
//     //         seedUsersAndRestaurants();
//     //         seedMenuItemsAndOrders();
//     //     }
//     // }
    
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