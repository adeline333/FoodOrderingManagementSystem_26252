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
        try {
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
            // All Users
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES (7, 'Adeline', 'Tuyizere', 'adelinetuyizere333@gmail.com', '$2a$10$jlyMvveLS3QgMnmdF.RT6.XUwS3iDnMOX9l16U4vcy3sE15Gl2VYu', 'CUSTOMER', '+250787510679', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES (8, 'Kamali', 'Philbert', 'philbertkamali5@gmail.com', '$2a$10$YYJUv0TLpKYM1udaHZnoKeJm11LnreOdYTc90UCr3STxmav1B1CA2', 'DELIVERY_PERSON', '+250783202555', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES (9, 'Adele', 'Tuyizere', 'adelinetuyizere5@gmail.com', '$2a$10$r4n6Lx8hIbYOSGnLAXLnR.9V91/rgMS8HHWsvynQ0iMN7u.zyNqae', 'ADMIN', '+250787510679', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES (10, 'philbert', 'Musasira', 'philbertmusasira3@gmail.com', '$2a$10$wiPRFYdzYnt859DWhYfmT.I0kbIh5wgLee06z2c3Kt/LQ2i.WQkKS', 'RESTAURANT_OWNER', '+250785637481', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES (11, 'Divine', 'Muhayimana', 'divyaine086@gmail.com', '$2a$10$l2lkGfGhprhHEjhD0jbKN.ma8qq1QvF2KuZzDoZqIIV2rE6aVJ.9a', 'RESTAURANT_OWNER', '+250789534787', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES (12, 'Fiston', 'Uz', 'fiston@gmail.com', '$2a$10$aPtMsANdw5IHE4jWPxi5t.CEyuM.lA3a0sWbKtpshM4LdcMQh2i6e', 'RESTAURANT_OWNER', '0785263279', false, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES (13, 'Fiston', 'Uza', 'youfistalline11@gmail.com', '$2a$10$6xUrj18kdX3vQAjy8snqWug.eZ0fmLKUJ98It5Z1D/6w3wMobEyKa', 'RESTAURANT_OWNER', '0785263279', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            "INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES (14, 'lindah', 'Iriza', 'irizalindah46@gmail.com', '$2a$10$k5iuUBCUqAXG2yhxGTg.mO/7uwpPlh3i5UxiQgRDva0HYWiZB1dFO', 'CUSTOMER', '+250785467321', true, 'LOCAL', NULL, NULL) ON CONFLICT DO NOTHING",
            
            // All Restaurants
            "INSERT INTO restaurants (id, name, description, address, phone, owner_id, location_id) VALUES (2, 'Philbert''s Kitchen', 'Authentic African and International cuisine with a modern twist', 'KG 15 Ave, Kigali Heights, Kigali', '+250 788 111 222', 10, NULL) ON CONFLICT DO NOTHING",
            "INSERT INTO restaurants (id, name, description, address, phone, owner_id, location_id) VALUES (3, 'Divine Delights', 'Fresh, healthy, and delicious meals made with love', 'KN 4 Ave, Nyarutarama, Kigali', '+250 788 333 444', 11, NULL) ON CONFLICT DO NOTHING",
            "INSERT INTO restaurants (id, name, description, address, phone, owner_id, location_id) VALUES (6, 'Trust restaurant', 'Rise and Shine with food', '123 Kacyiru', '+250786547432', 13, NULL) ON CONFLICT DO NOTHING",
            
            // Philbert's Kitchen Menu (restaurant_id = 2) - APPETIZERS
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (5, 'Sambaza Fries', 'APPETIZER', 'Crispy fried Lake Kivu sardines served with spicy sauce and fries', 4500, 2, 'https://cdn.pixabay.com/photo/2016/03/09/09/45/fried-fish-1246434_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (6, 'Chicken Wings', 'APPETIZER', 'Crispy buffalo wings served with blue cheese dip and celery sticks', 5500, 2, 'https://cdn.pixabay.com/photo/2017/05/28/10/48/chicken-wings-2349642_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (7, 'Spring Rolls', 'APPETIZER', 'Crispy vegetable spring rolls with sweet chili dipping sauce', 3500, 2, 'https://cdn.pixabay.com/photo/2020/06/15/18/37/spring-rolls-5302929_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (8, 'Garlic Bread', 'APPETIZER', 'Toasted baguette with garlic butter and melted mozzarella cheese', 2500, 2, 'https://cdn.pixabay.com/photo/2017/12/09/08/18/bread-3007395_640.jpg', true) ON CONFLICT DO NOTHING",
            // Philbert's Kitchen - MAIN COURSES
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (9, 'Classic Cheeseburger', 'MAIN_COURSE', 'Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce', 7500, 2, 'https://cdn.pixabay.com/photo/2019/05/16/14/19/burger-4207360_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (10, 'Brochette Platter', 'MAIN_COURSE', 'Grilled beef and goat skewers served with ugali and kachumbari', 8500, 2, 'https://cdn.pixabay.com/photo/2020/07/01/08/56/kebab-5356390_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (11, 'Grilled Tilapia', 'MAIN_COURSE', 'Fresh Lake Kivu tilapia grilled with African spices, served with plantains', 12000, 2, 'https://cdn.pixabay.com/photo/2016/11/19/15/40/grilled-fish-1840532_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (12, 'BBQ Ribs', 'MAIN_COURSE', 'Tender pork ribs glazed with smoky BBQ sauce, served with coleslaw', 14000, 2, 'https://cdn.pixabay.com/photo/2017/03/28/12/10/ribs-2181670_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (13, 'Chicken Tikka Masala', 'MAIN_COURSE', 'Tender chicken in creamy tomato curry sauce with basmati rice', 9500, 2, 'https://cdn.pixabay.com/photo/2021/02/21/06/05/tikka-masala-6040166_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (14, 'Pepperoni Pizza', 'MAIN_COURSE', 'Classic pizza loaded with pepperoni and melted mozzarella cheese', 11000, 2, 'https://cdn.pixabay.com/photo/2017/12/25/15/54/pizza-3036127_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (15, 'Isombe with Beef', 'MAIN_COURSE', 'Traditional cassava leaves cooked with palm oil, served with rice and beef stew', 6500, 2, 'https://cdn.pixabay.com/photo/2020/07/08/12/31/african-meal-5384901_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (16, 'Beef Stew with Ugali', 'MAIN_COURSE', 'Slow-cooked beef stew served with traditional ugali', 7000, 2, 'https://cdn.pixabay.com/photo/2019/09/18/20/41/beef-stew-4487014_640.jpg', true) ON CONFLICT DO NOTHING",
            // Philbert's Kitchen - DESSERT
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (17, 'Chocolate Lava Cake', 'DESSERT', 'Warm chocolate cake with a molten center, served with vanilla ice cream', 4500, 2, 'https://cdn.pixabay.com/photo/2015/11/07/11/35/chocolate-cake-1031410_640.jpg', true) ON CONFLICT DO NOTHING",
            
            // Divine Delights Menu (restaurant_id = 3) - APPETIZERS
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (32, 'Caesar Salad', 'APPETIZER', 'Crispy romaine lettuce with parmesan cheese, croutons, and Caesar dressing', 4500, 3, 'https://cdn.pixabay.com/photo/2020/08/06/18/54/salad-5469847_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (33, 'Greek Salad', 'APPETIZER', 'Fresh tomatoes, cucumbers, olives, and feta cheese with olive oil dressing', 5000, 3, 'https://cdn.pixabay.com/photo/2021/01/08/07/36/greek-salad-5900858_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (34, 'Avocado Toast', 'APPETIZER', 'Sourdough bread topped with smashed avocado, cherry tomatoes, and poached egg', 5500, 3, 'https://cdn.pixabay.com/photo/2016/12/26/17/28/avocado-on-toast-1934647_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (35, 'Bruschetta', 'APPETIZER', 'Toasted bread topped with fresh tomatoes, basil, and balsamic glaze', 3500, 3, 'https://cdn.pixabay.com/photo/2021/03/23/17/56/bruschetta-6120030_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (36, 'Soup of the Day', 'APPETIZER', 'Fresh homemade soup - ask for today''s special', 3000, 3, 'https://cdn.pixabay.com/photo/2017/01/20/12/05/tomato-soup-1995307_640.jpg', true) ON CONFLICT DO NOTHING",
            // Divine Delights - MAIN COURSES
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (37, 'Grilled Salmon', 'MAIN_COURSE', 'Fresh Atlantic salmon with lemon butter sauce and steamed vegetables', 15000, 3, 'https://cdn.pixabay.com/photo/2016/08/11/23/48/grilled-salmon-1587926_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (38, 'Margherita Pizza', 'MAIN_COURSE', 'Traditional Italian pizza with fresh tomatoes, mozzarella, and basil', 9500, 3, 'https://cdn.pixabay.com/photo/2019/08/21/09/29/pizza-4421521_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (39, 'Pasta Carbonara', 'MAIN_COURSE', 'Creamy spaghetti with crispy bacon, parmesan cheese, and egg yolk', 8500, 3, 'https://cdn.pixabay.com/photo/2017/02/28/16/10/pasta-2105191_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (40, 'Quinoa Buddha Bowl', 'MAIN_COURSE', 'Healthy bowl with quinoa, roasted vegetables, chickpeas, and tahini dressing', 8000, 3, 'https://cdn.pixabay.com/photo/2018/04/10/16/29/food-3311110_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (41, 'Fish and Chips', 'MAIN_COURSE', 'Beer-battered cod with crispy fries and tartar sauce', 10000, 3, 'https://cdn.pixabay.com/photo/2017/03/21/02/26/fish-and-chips-2160846_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (42, 'Beef Tacos', 'MAIN_COURSE', 'Three soft tacos with seasoned beef, salsa, cheese, and sour cream', 7500, 3, 'https://cdn.pixabay.com/photo/2014/08/04/17/35/mexican-food-410629_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (43, 'Pad Thai', 'MAIN_COURSE', 'Stir-fried rice noodles with shrimp, tofu, peanuts, and lime', 9000, 3, 'https://cdn.pixabay.com/photo/2018/07/14/15/27/eat-3537960_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (44, 'Veggie Wrap', 'MAIN_COURSE', 'Whole wheat wrap with hummus, grilled vegetables, and feta cheese', 6500, 3, 'https://cdn.pixabay.com/photo/2017/07/04/18/31/wrap-2473237_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (45, 'Grilled Chicken Breast', 'MAIN_COURSE', 'Herb-marinated chicken breast with mashed potatoes and vegetables', 9500, 3, 'https://cdn.pixabay.com/photo/2020/04/18/13/09/chicken-5062841_640.jpg', true) ON CONFLICT DO NOTHING",
            // Divine Delights - DESSERTS
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (46, 'New York Cheesecake', 'DESSERT', 'Creamy classic cheesecake with strawberry topping', 4500, 3, 'https://cdn.pixabay.com/photo/2016/11/22/19/15/cheesecake-1850011_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (47, 'Tiramisu', 'DESSERT', 'Italian coffee-flavored dessert with mascarpone and cocoa', 5000, 3, 'https://cdn.pixabay.com/photo/2018/08/19/12/50/tiramisu-3614486_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (48, 'Fresh Fruit Bowl', 'DESSERT', 'Seasonal fresh fruits with honey and mint', 3500, 3, 'https://cdn.pixabay.com/photo/2018/04/10/15/38/fruit-3305209_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (49, 'Apple Pie', 'DESSERT', 'Warm apple pie with cinnamon, served with vanilla ice cream', 4000, 3, 'https://cdn.pixabay.com/photo/2016/11/29/01/10/apple-pie-1867937_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (50, 'Chocolate Brownie', 'DESSERT', 'Rich chocolate brownie with walnuts and whipped cream', 3500, 3, 'https://cdn.pixabay.com/photo/2017/08/02/16/21/brownie-2573837_640.jpg', true) ON CONFLICT DO NOTHING",
            // Divine Delights - BEVERAGES
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (51, 'Fresh Lemonade', 'BEVERAGE', 'Freshly squeezed lemons with mint and a hint of honey', 2000, 3, 'https://cdn.pixabay.com/photo/2020/05/02/09/27/lemonade-5121127_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (52, 'Mango Smoothie', 'BEVERAGE', 'Creamy blend of fresh mangoes, yogurt, and honey', 3000, 3, 'https://cdn.pixabay.com/photo/2019/07/01/19/35/fruit-smoothie-4312547_640.jpg', true) ON CONFLICT DO NOTHING",
            
            // Trust Restaurant Menu (restaurant_id = 6) - APPETIZERS
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (65, 'Spring Rolls', 'APPETIZER', 'Crispy vegetable spring rolls served with sweet chili sauce', 2500, 6, 'https://cdn.pixabay.com/photo/2020/06/15/18/37/spring-rolls-5302929_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (66, 'Samosas', 'APPETIZER', 'Spiced potato and pea filled pastries', 2000, 6, 'https://cdn.pixabay.com/photo/2018/09/23/19/47/samosas-3698308_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (67, 'Chicken Wings', 'APPETIZER', 'Spicy buffalo chicken wings with ranch dip', 4500, 6, 'https://cdn.pixabay.com/photo/2017/05/28/10/48/chicken-wings-2349642_640.jpg', true) ON CONFLICT DO NOTHING",
            // Trust Restaurant - MAIN COURSES
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (63, 'Beef Katogo', 'MAIN_COURSE', 'Best African beef katogo', 12000, 6, 'https://nativeexpeditions.travel/wp-content/uploads/2022/03/Beef-Katogo.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (64, 'Special Chicken and Rice', 'MAIN_COURSE', 'The best fried chicken and rice seasoned with African spices', 10000, 6, 'https://seeafricatoday.com/wp-content/uploads/2019/07/food34.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (68, 'Grilled Tilapia', 'MAIN_COURSE', 'Fresh lake tilapia grilled with herbs, served with ugali and vegetables', 8500, 6, 'https://cdn.pixabay.com/photo/2016/11/19/15/40/grilled-fish-1840532_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (69, 'Beef Brochettes', 'MAIN_COURSE', 'Tender beef skewers marinated in African spices with fries', 7000, 6, 'https://cdn.pixabay.com/photo/2020/07/01/08/56/kebab-5356390_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (70, 'Chicken Curry', 'MAIN_COURSE', 'Creamy chicken curry served with fragrant rice', 6500, 6, 'https://cdn.pixabay.com/photo/2021/02/21/06/05/tikka-masala-6040166_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (71, 'Isombe with Meat', 'MAIN_COURSE', 'Traditional cassava leaves with tender beef and rice', 5500, 6, 'https://cdn.pixabay.com/photo/2020/07/08/12/31/african-meal-5384901_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (72, 'Grilled Steak', 'MAIN_COURSE', 'Premium beef steak with mushroom sauce and mashed potatoes', 12000, 6, 'https://cdn.pixabay.com/photo/2017/07/16/10/43/steak-2507247_640.jpg', true) ON CONFLICT DO NOTHING",
            // Trust Restaurant - SIDES
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (73, 'French Fries', 'SIDE_DISH', 'Crispy golden fries with ketchup', 2000, 6, 'https://cdn.pixabay.com/photo/2019/06/11/12/26/french-fries-4267877_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (74, 'Ugali', 'SIDE_DISH', 'Traditional East African cornmeal side dish', 1000, 6, 'https://cdn.pixabay.com/photo/2020/07/11/10/05/corn-5393370_640.jpg', true) ON CONFLICT DO NOTHING",
            
            // Orders Data
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (2, 'Gikondo', '2025-12-19 11:15:36.33643', 'PENDING', 17052.98999999998, 9) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (3, 'Gikondo', '2025-12-19 11:41:43.831825', 'PENDING', 17052.98999999998, 9) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (4, 'Gikondo', '2025-12-19 12:09:15.560805', 'PENDING', 17052.98999999998, 7) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (5, 'Gikondo', '2025-12-19 12:09:23.770967', 'PENDING', 17052.98999999998, 7) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (6, 'Gikondo', '2025-12-19 12:11:15.437494', 'PENDING', 17052.98999999998, 7) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (7, 'Gikondo', '2025-12-19 13:35:32.635146', 'PENDING', 51.39, 7) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (8, 'Gikondo', '2025-12-19 13:35:35.749635', 'PENDING', 51.39, 7) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (9, 'kacyiru', '2025-12-19 13:59:37.033903', 'DELIVERED', 548.4, 7) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (10, 'Gatsata', '2025-12-20 17:13:15.435507', 'CONFIRMED', 2713.2, 7) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (11, 'kabuga', '2025-12-22 13:24:40.201752', 'CONFIRMED', 14250, 9) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (12, 'Nyabugogo', '2025-12-22 13:37:55.608524', 'ON_THE_WAY', 18100, 10) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (13, 'Nyaugogo', '2025-12-22 17:57:15.490532', 'CONFIRMED', 17550, 92022/03/Beef-Katogo.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (64, 'Special Chicken and Rice', 'MAIN_COURSE', 'The best fried chicken and rice seasoned with African spices', 10000, 6, 'https://seeafricatoday.com/wp-content/uploads/2019/07/food34.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (68, 'Grilled Tilapia', 'MAIN_COURSE', 'Fresh lake tilapia grilled with herbs, served with ugali and vegetables', 8500, 6, 'https://cdn.pixabay.com/photo/2016/11/19/15/40/grilled-fish-1840532_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (69, 'Beef Brochettes', 'MAIN_COURSE', 'Tender beef skewers marinated in African spices with fries', 7000, 6, 'https://cdn.pixabay.com/photo/2020/07/01/08/56/kebab-5356390_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (70, 'Chicken Curry', 'MAIN_COURSE', 'Creamy chicken curry served with fragrant rice', 6500, 6, 'https://cdn.pixabay.com/photo/2021/02/21/06/05/tikka-masala-6040166_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (71, 'Isombe with Meat', 'MAIN_COURSE', 'Traditional cassava leaves with tender beef and rice', 5500, 6, 'https://cdn.pixabay.com/photo/2020/07/08/12/31/african-meal-5384901_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (72, 'Grilled Steak', 'MAIN_COURSE', 'Premium beef steak with mushroom sauce and mashed potatoes', 12000, 6, 'https://cdn.pixabay.com/photo/2017/07/16/10/43/steak-2507247_640.jpg', true) ON CONFLICT DO NOTHING",
            // Trust Restaurant - SIDES
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (73, 'French Fries', 'SIDE_DISH', 'Crispy golden fries with ketchup', 2000, 6, 'https://cdn.pixabay.com/photo/2019/06/11/12/26/french-fries-4267877_640.jpg', true) ON CONFLICT DO NOTHING",
            "INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES (74, 'Ugali', 'SIDE_DISH', 'Traditional East African cornmeal side dish', 1000, 6, 'https://cdn.pixabay.com/photo/2020/07/11/10/05/corn-5393370_640.jpg', true) ON CONFLICT DO NOTHING",
            
            // Orders Data
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (2, 'Gikondo', '2025-12-19 11:15:36.33643', 'PENDING', 17052.98999999998, 9) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (3, 'Gikondo', '2025-12-19 11:41:43.831825', 'PENDING', 17052.98999999998, 9) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (4, 'Gikondo', '2025-12-19 12:09:15.560805', 'PENDING', 17052.98999999998, 7) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (5, 'Gikondo', '2025-12-19 12:09:23.770967', 'PENDING', 17052.98999999998, 7) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (6, 'Gikondo', '2025-12-19 12:11:15.437494', 'PENDING', 17052.98999999998, 7) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (7, 'Gikondo', '2025-12-19 13:35:32.635146', 'PENDING', 51.39, 7) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (8, 'Gikondo', '2025-12-19 13:35:35.749635', 'PENDING', 51.39, 7) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (9, 'kacyiru', '2025-12-19 13:59:37.033903', 'DELIVERED', 548.4, 7) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (10, 'Gatsata', '2025-12-20 17:13:15.435507', 'CONFIRMED', 2713.2, 7) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (11, 'kabuga', '2025-12-22 13:24:40.201752', 'CONFIRMED', 14250, 9) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (12, 'Nyabugogo', '2025-12-22 13:37:55.608524', 'ON_THE_WAY', 18100, 10) ON CONFLICT DO NOTHING",
            "INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES (13, 'Nyaugogo', '2025-12-22 17:57:15.490532', 'CONFIRMED', 17550, 9) ON CONFLICT DO NOTHING"
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