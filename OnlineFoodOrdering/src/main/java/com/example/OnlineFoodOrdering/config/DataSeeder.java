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
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES (7, 'Adeline', 'Tuyizere', 'adelinetuyizere333@gmail.com', '$2a$10$jlyMvveLS3QgMnmdF.RT6.XUwS3iDnMOX9l16U4vcy3sE15Gl2VYu', 'CUSTOMER', '+250787510679', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES (9, 'Adele', 'Tuyizere', 'adelinetuyizere5@gmail.com', '$2a$10$r4n6Lx8hIbYOSGnLAXLnR.9V91/rgMS8HHWsvynQ0iMN7u.zyNqae', 'ADMIN', '+250787510679', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES (10, 'philbert', 'Musasira', 'philbertmusasira3@gmail.com', '$2a$10$wiPRFYdzYnt859DWhYfmT.I0kbIh5wgLee06z2c3Kt/LQ2i.WQkKS', 'RESTAURANT_OWNER', '+250785637481', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES (11, 'Divine', 'Muhayimana', 'divyaine086@gmail.com', '$2a$10$l2lkGfGhprhHEjhD0jbKN.ma8qq1QvF2KuZzDoZqIIV2rE6aVJ.9a', 'RESTAURANT_OWNER', '+250789534787', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES (13, 'Fiston', 'Uza', 'youfistalline11@gmail.com', '$2a$10$6xUrj18kdX3vQAjy8snqWug.eZ0fmLKUJ98It5Z1D/6w3wMobEyKa', 'RESTAURANT_OWNER', '0785263279', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES (14, 'lindah', 'Iriza', 'irizalindah46@gmail.com', '$2a$10$k5iuUBCUqAXG2yhxGTg.mO/7uwpPlh3i5UxiQgRDva0HYWiZB1dFO', 'CUSTOMER', '+250785467321', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            
            // Restaurants
            "INSERT INTO restaurants (id, name, description, address, phone, owner_id, location_id) VALUES (2, 'Philbert''s Kitchen', 'Authentic African and International cuisine with a modern twist', 'KG 15 Ave, Kigali Heights, Kigali', '+250 788 111 222', 10, NULL) ON CONFLICT DO NOTHING",
            "INSERT INTO restaurants (id, name, description, address, phone, owner_id, location_id) VALUES (3, 'Divine Delights', 'Fresh, healthy, and delicious meals made with love', 'KN 4 Ave, Nyarutarama, Kigali', '+250 788 333 444', 11, NULL) ON CONFLICT DO NOTHING",
            "INSERT INTO restaurants (id, name, description, address, phone, owner_id, location_id) VALUES (6, 'Trust restaurant', 'Rise and Shine with food', '123 Kacyiru', '+250786547432', 13, NULL) ON CONFLICT DO NOTHING",
            
            // Menu Items - Philbert's Kitchen (restaurant_id = 2)
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (5, 'Sambaza Fries', 'APPETIZER', 'Crispy fried Lake Kivu sardines served with spicy sauce and fries', 4500, 2, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (6, 'Chicken Wings', 'APPETIZER', 'Crispy buffalo wings served with blue cheese dip and celery sticks', 5500, 2, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (7, 'Spring Rolls', 'APPETIZER', 'Crispy vegetable spring rolls with sweet chili dipping sauce', 3500, 2, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (8, 'Garlic Bread', 'APPETIZER', 'Toasted baguette with garlic butter and melted mozzarella cheese', 2500, 2, 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (9, 'Classic Cheeseburger', 'MAIN_COURSE', 'Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce', 7500, 2, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (10, 'Brochette Platter', 'MAIN_COURSE', 'Grilled beef and goat skewers served with ugali and kachumbari', 8500, 2, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (11, 'Grilled Tilapia', 'MAIN_COURSE', 'Fresh Lake Kivu tilapia grilled with African spices, served with plantains', 12000, 2, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (12, 'BBQ Ribs', 'MAIN_COURSE', 'Tender pork ribs glazed with smoky BBQ sauce, served with coleslaw', 14000, 2, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (13, 'Chicken Tikka Masala', 'MAIN_COURSE', 'Tender chicken in creamy tomato curry sauce with basmati rice', 9500, 2, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (14, 'Pepperoni Pizza', 'MAIN_COURSE', 'Classic pizza loaded with pepperoni and melted mozzarella cheese', 11000, 2, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (15, 'Isombe with Beef', 'MAIN_COURSE', 'Traditional cassava leaves cooked with palm oil, served with rice and beef stew', 6500, 2, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (16, 'Beef Stew with Ugali', 'MAIN_COURSE', 'Slow-cooked beef stew served with traditional ugali', 7000, 2, 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (17, 'Chocolate Lava Cake', 'DESSERT', 'Warm chocolate cake with a molten center, served with vanilla ice cream', 4500, 2, 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            
            // Menu Items - Divine Delights (restaurant_id = 3)
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (32, 'Caesar Salad', 'APPETIZER', 'Crispy romaine lettuce with parmesan cheese, croutons, and Caesar dressing', 4500, 3, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (33, 'Greek Salad', 'APPETIZER', 'Fresh tomatoes, cucumbers, olives, and feta cheese with olive oil dressing', 5000, 3, 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (34, 'Avocado Toast', 'APPETIZER', 'Sourdough bread topped with smashed avocado, cherry tomatoes, and poached egg', 5500, 3, 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (35, 'Bruschetta', 'APPETIZER', 'Toasted bread topped with fresh tomatoes, basil, and balsamic glaze', 3500, 3, 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (36, 'Soup of the Day', 'APPETIZER', 'Fresh homemade soup - ask for today''s special', 3000, 3, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (37, 'Grilled Salmon', 'MAIN_COURSE', 'Fresh Atlantic salmon with lemon butter sauce and steamed vegetables', 15000, 3, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (38, 'Margherita Pizza', 'MAIN_COURSE', 'Traditional Italian pizza with fresh tomatoes, mozzarella, and basil', 9500, 3, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (39, 'Pasta Carbonara', 'MAIN_COURSE', 'Creamy spaghetti with crispy bacon, parmesan cheese, and egg yolk', 8500, 3, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (40, 'Quinoa Buddha Bowl', 'MAIN_COURSE', 'Healthy bowl with quinoa, roasted vegetables, chickpeas, and tahini dressing', 8000, 3, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (41, 'Fish and Chips', 'MAIN_COURSE', 'Beer-battered cod with crispy fries and tartar sauce', 10000, 3, 'https://images.unsplash.com/photo-1579208030886-b937da0925dc?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (42, 'Beef Tacos', 'MAIN_COURSE', 'Three soft tacos with seasoned beef, salsa, cheese, and sour cream', 7500, 3, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (43, 'Pad Thai', 'MAIN_COURSE', 'Stir-fried rice noodles with shrimp, tofu, peanuts, and lime', 9000, 3, 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (44, 'Veggie Wrap', 'MAIN_COURSE', 'Whole wheat wrap with hummus, grilled vegetables, and feta cheese', 6500, 3, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (45, 'Grilled Chicken Breast', 'MAIN_COURSE', 'Herb-marinated chicken breast with mashed potatoes and vegetables', 9500, 3, 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (46, 'New York Cheesecake', 'DESSERT', 'Creamy classic cheesecake with strawberry topping', 4500, 3, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (47, 'Tiramisu', 'DESSERT', 'Italian coffee-flavored dessert with mascarpone and cocoa', 5000, 3, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (48, 'Fresh Fruit Bowl', 'DESSERT', 'Seasonal fresh fruits with honey and mint', 3500, 3, 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (49, 'Apple Pie', 'DESSERT', 'Warm apple pie with cinnamon, served with vanilla ice cream', 4000, 3, 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (50, 'Chocolate Brownie', 'DESSERT', 'Rich chocolate brownie with walnuts and whipped cream', 3500, 3, 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (51, 'Fresh Lemonade', 'BEVERAGE', 'Freshly squeezed lemons with mint and a hint of honey', 2000, 3, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (52, 'Mango Smoothie', 'BEVERAGE', 'Creamy blend of fresh mangoes, yogurt, and honey', 3000, 3, 'https://images.unsplash.com/photo-1590080876?w=400&h=300&fit=crop', true) ON CONFLICT DO NOTHING",
            
            // Menu Items - Trust restaurant (restaurant_id = 6)
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (63, 'Beef katogo', 'MAIN_COURSE', 'Best african beef katogo', 12, 6, 'https://nativeexpeditions.travel/wp-content/uploads/2022/03/Beef-Katogo.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (64, 'Special chicken and rice', 'MAIN_COURSE', 'The best fried chicken and rice seasoned with African spices', 10, 6, 'https://seeafricatoday.com/wp-content/uploads/2019/07/food34.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (65, 'Spring Rolls', 'APPETIZER', 'Crispy vegetable spring rolls served with sweet chili sauce', 2500, 6, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (66, 'Samosas', 'APPETIZER', 'Spiced potato and pea filled pastries', 2000, 6, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (67, 'Chicken Wings', 'APPETIZER', 'Spicy buffalo chicken wings with ranch dip', 4500, 6, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (68, 'Grilled Tilapia', 'MAIN_COURSE', 'Fresh lake tilapia grilled with herbs, served with ugali and vegetables', 8500, 6, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (69, 'Beef Brochettes', 'MAIN_COURSE', 'Tender beef skewers marinated in African spices with fries', 7000, 6, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (70, 'Chicken Curry', 'MAIN_COURSE', 'Creamy chicken curry served with fragrant rice', 6500, 6, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (71, 'Isombe with Meat', 'MAIN_COURSE', 'Traditional cassava leaves with tender beef and rice', 5500, 6, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (72, 'Grilled Steak', 'MAIN_COURSE', 'Premium beef steak with mushroom sauce and mashed potatoes', 12000, 6, 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (73, 'French Fries', 'SIDE_DISH', 'Crispy golden fries with ketchup', 2000, 6, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (74, 'Ugali', 'SIDE_DISH', 'Traditional East African cornmeal side dish', 1000, 6, 'https://images.unsplash.com/photo-1', true) ON CONFLICT DO NOTHING"
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