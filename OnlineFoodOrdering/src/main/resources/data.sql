-- Your Local Database Seed Data
-- ==========================================
-- Users from your local database
INSERT INTO users (id, first_name, last_name, email, password, role, phone, email_verified, auth_provider, provider_id, location_id) VALUES
(7, 'Adeline', 'Tuyizere', 'adelinetuyizere333@gmail.com', '$2a$10$jlyMvveLS3QgMnmdF.RT6.XUwS3iDnMOX9l16U4vcy3sE15Gl2VYu', 'CUSTOMER', '+250787510679', true, 'LOCAL', NULL, NULL),
(8, 'Kamali', 'Philbert', 'philbertkamali5@gmail.com', '$2a$10$YYJUv0TLpKYM1udaHZnoKeJm11LnreOdYTc90UCr3STxmav1B1CA2', 'DELIVERY_PERSON', '+250783202555', true, 'LOCAL', NULL, NULL),
(9, 'Adele', 'Tuyizere', 'adelinetuyizere5@gmail.com', '$2a$10$r4n6Lx8hIbYOSGnLAXLnR.9V91/rgMS8HHWsvynQ0iMN7u.zyNqae', 'ADMIN', '+250787510679', true, 'LOCAL', NULL, NULL),
(10, 'philbert', 'Musasira', 'philbertmusasira3@gmail.com', '$2a$10$wiPRFYdzYnt859DWhYfmT.I0kbIh5wgLee06z2c3Kt/LQ2i.WQkKS', 'RESTAURANT_OWNER', '+250785637481', true, 'LOCAL', NULL, NULL),
(11, 'Divine', 'Muhayimana', 'divyaine086@gmail.com', '$2a$10$l2lkGfGhprhHEjhD0jbKN.ma8qq1QvF2KuZzDoZqIIV2rE6aVJ.9a', 'RESTAURANT_OWNER', '+250789534787', true, 'LOCAL', NULL, NULL),
(12, 'Fiston', 'Uz', 'fiston@gmail.com', '$2a$10$aPtMsANdw5IHE4jWPxi5t.CEyuM.lA3a0sWbKtpshM4LdcMQh2i6e', 'RESTAURANT_OWNER', '0785263279', false, 'LOCAL', NULL, NULL),
(13, 'Fiston', 'Uza', 'youfistalline11@gmail.com', '$2a$10$6xUrj18kdX3vQAjy8snqWug.eZ0fmLKUJ98It5Z1D/6w3wMobEyKa', 'RESTAURANT_OWNER', '0785263279', true, 'LOCAL', NULL, NULL),
(14, 'lindah', 'Iriza', 'irizalindah46@gmail.com', '$2a$10$k5iuUBCUqAXG2yhxGTg.mO/7uwpPlh3i5UxiQgRDva0HYWiZB1dFO', 'CUSTOMER', '+250785467321', true, 'LOCAL', NULL, NULL);

-- Restaurants from your local database
INSERT INTO restaurants (id, name, description, address, phone, owner_id, location_id, image_url) VALUES
(2, 'Philbert''s Kitchen', 'Authentic African and International cuisine with a modern twist', 'KG 15 Ave, Kigali Heights, Kigali', '+250 788 111 222', 10, NULL, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=300&fit=crop'),
(3, 'Divine Delights', 'Fresh, healthy, and delicious meals made with love', 'KN 4 Ave, Nyarutarama, Kigali', '+250 788 333 444', 11, NULL, 'https://images.unsplash.com/photo-1504674900152-b8b80e7ddb93?w=600&h=300&fit=crop'),
(6, 'Trust restaurant', 'Rise and Shine with food', '123 Kacyiru', '+250786547432', 13, NULL, 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&h=300&fit=crop');

-- Menu Items for Philbert's Kitchen (restaurant_id = 2)
INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES
(5, 'Sambaza Fries', 'APPETIZER', 'Crispy fried Lake Kivu sardines served with spicy sauce and fries', 4500, 2, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', true),
(6, 'Chicken Wings', 'APPETIZER', 'Crispy buffalo wings served with blue cheese dip and celery sticks', 5500, 2, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop', true),
(7, 'Spring Rolls', 'APPETIZER', 'Crispy vegetable spring rolls with sweet chili dipping sauce', 3500, 2, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', true),
(8, 'Garlic Bread', 'APPETIZER', 'Toasted baguette with garlic butter and melted mozzarella cheese', 2500, 2, 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400&h=300&fit=crop', true),
(9, 'Classic Cheeseburger', 'MAIN_COURSE', 'Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce', 7500, 2, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', true),
(10, 'Brochette Platter', 'MAIN_COURSE', 'Grilled beef and goat skewers served with ugali and kachumbari', 8500, 2, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop', true),
(11, 'Grilled Tilapia', 'MAIN_COURSE', 'Fresh Lake Kivu tilapia grilled with African spices, served with plantains', 12000, 2, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', true),
(12, 'BBQ Ribs', 'MAIN_COURSE', 'Tender pork ribs glazed with smoky BBQ sauce, served with coleslaw', 14000, 2, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', true),
(13, 'Chicken Tikka Masala', 'MAIN_COURSE', 'Tender chicken in creamy tomato curry sauce with basmati rice', 9500, 2, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', true),
(14, 'Pepperoni Pizza', 'MAIN_COURSE', 'Classic pizza loaded with pepperoni and melted mozzarella cheese', 11000, 2, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', true),
(15, 'Isombe with Beef', 'MAIN_COURSE', 'Traditional cassava leaves cooked with palm oil, served with rice and beef stew', 6500, 2, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', true),
(16, 'Beef Stew with Ugali', 'MAIN_COURSE', 'Slow-cooked beef stew served with traditional ugali', 7000, 2, 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop', true),
(17, 'Chocolate Lava Cake', 'DESSERT', 'Warm chocolate cake with a molten center, served with vanilla ice cream', 4500, 2, 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop', true);

-- Menu Items for Divine Delights (restaurant_id = 3)
INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES
(32, 'Caesar Salad', 'APPETIZER', 'Crispy romaine lettuce with parmesan cheese, croutons, and Caesar dressing', 4500, 3, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', true),
(33, 'Greek Salad', 'APPETIZER', 'Fresh tomatoes, cucumbers, olives, and feta cheese with olive oil dressing', 5000, 3, 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop', true),
(34, 'Avocado Toast', 'APPETIZER', 'Sourdough bread topped with smashed avocado, cherry tomatoes, and poached egg', 5500, 3, 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop', true),
(35, 'Bruschetta', 'APPETIZER', 'Toasted bread topped with fresh tomatoes, basil, and balsamic glaze', 3500, 3, 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop', true),
(36, 'Soup of the Day', 'APPETIZER', 'Fresh homemade soup - ask for today''s special', 3000, 3, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', true),
(37, 'Grilled Salmon', 'MAIN_COURSE', 'Fresh Atlantic salmon with lemon butter sauce and steamed vegetables', 15000, 3, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', true),
(38, 'Margherita Pizza', 'MAIN_COURSE', 'Traditional Italian pizza with fresh tomatoes, mozzarella, and basil', 9500, 3, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&h=300&fit=crop', true),
(39, 'Pasta Carbonara', 'MAIN_COURSE', 'Creamy spaghetti with crispy bacon, parmesan cheese, and egg yolk', 8500, 3, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop', true),
(40, 'Quinoa Buddha Bowl', 'MAIN_COURSE', 'Healthy bowl with quinoa, roasted vegetables, chickpeas, and tahini dressing', 8000, 3, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', true),
(41, 'Fish and Chips', 'MAIN_COURSE', 'Beer-battered cod with crispy fries and tartar sauce', 10000, 3, 'https://images.unsplash.com/photo-1579208030886-b937da0925dc?w=400&h=300&fit=crop', true),
(42, 'Beef Tacos', 'MAIN_COURSE', 'Three soft tacos with seasoned beef, salsa, cheese, and sour cream', 7500, 3, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop', true),
(43, 'Pad Thai', 'MAIN_COURSE', 'Stir-fried rice noodles with shrimp, tofu, peanuts, and lime', 9000, 3, 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=300&fit=crop', true),
(44, 'Veggie Wrap', 'MAIN_COURSE', 'Whole wheat wrap with hummus, grilled vegetables, and feta cheese', 6500, 3, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', true),
(45, 'Grilled Chicken Breast', 'MAIN_COURSE', 'Herb-marinated chicken breast with mashed potatoes and vegetables', 9500, 3, 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop', true),
(46, 'New York Cheesecake', 'DESSERT', 'Creamy classic cheesecake with strawberry topping', 4500, 3, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop', true),
(47, 'Tiramisu', 'DESSERT', 'Italian coffee-flavored dessert with mascarpone and cocoa', 5000, 3, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', true),
(48, 'Fresh Fruit Bowl', 'DESSERT', 'Seasonal fresh fruits with honey and mint', 3500, 3, 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop', true),
(49, 'Apple Pie', 'DESSERT', 'Warm apple pie with cinnamon, served with vanilla ice cream', 4000, 3, 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=400&h=300&fit=crop', true),
(50, 'Chocolate Brownie', 'DESSERT', 'Rich chocolate brownie with walnuts and whipped cream', 3500, 3, 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&h=300&fit=crop', true),
(51, 'Fresh Lemonade', 'BEVERAGE', 'Freshly squeezed lemons with mint and a hint of honey', 2000, 3, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop', true),
(52, 'Mango Smoothie', 'BEVERAGE', 'Creamy blend of fresh mangoes, yogurt, and honey', 3000, 3, 'https://images.unsplash.com/photo-1590080876?w=400&h=300&fit=crop', true);

-- Menu Items for Trust restaurant (restaurant_id = 6)
INSERT INTO menu_items (id, name, category, description, price, restaurant_id, image_url, available) VALUES
(63, 'Beef katogo', 'MAIN_COURSE', 'Best african beef katogo', 12, 6, 'https://nativeexpeditions.travel/wp-content/uploads/2022/03/Beef-Katogo.jpg', true),
(64, 'Special chicken and rice', 'MAIN_COURSE', 'The best fried chicken and rice seasoned with African spices', 10, 6, 'https://seeafricatoday.com/wp-content/uploads/2019/07/food34.jpg', true),
(65, 'Spring Rolls', 'APPETIZER', 'Crispy vegetable spring rolls served with sweet chili sauce', 2500, 6, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', true),
(66, 'Samosas', 'APPETIZER', 'Spiced potato and pea filled pastries', 2000, 6, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', true),
(67, 'Chicken Wings', 'APPETIZER', 'Spicy buffalo chicken wings with ranch dip', 4500, 6, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400', true),
(68, 'Grilled Tilapia', 'MAIN_COURSE', 'Fresh lake tilapia grilled with herbs, served with ugali and vegetables', 8500, 6, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', true),
(69, 'Beef Brochettes', 'MAIN_COURSE', 'Tender beef skewers marinated in African spices with fries', 7000, 6, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', true),
(70, 'Chicken Curry', 'MAIN_COURSE', 'Creamy chicken curry served with fragrant rice', 6500, 6, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', true),
(71, 'Isombe with Meat', 'MAIN_COURSE', 'Traditional cassava leaves with tender beef and rice', 5500, 6, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', true),
(72, 'Grilled Steak', 'MAIN_COURSE', 'Premium beef steak with mushroom sauce and mashed potatoes', 12000, 6, 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400', true),
(73, 'French Fries', 'SIDE_DISH', 'Crispy golden fries with ketchup', 2000, 6, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', true),
(74, 'Ugali', 'SIDE_DISH', 'Traditional East African cornmeal side dish', 1000, 6, 'https://images.unsplash.com/photo-1', true);

-- Orders from your local database (optional - for reference)
INSERT INTO orders (id, delivery_address, order_date, status, total_amount, customer_id) VALUES
(2, 'Gikondo', '2025-12-19 11:15:36.33643', 'PENDING', 17052.98999999998, 9),
(3, 'Gikondo', '2025-12-19 11:41:43.831825', 'PENDING', 17052.98999999998, 9),
(4, 'Gikondo', '2025-12-19 12:09:15.560805', 'PENDING', 17052.98999999998, 7),
(5, 'Gikondo', '2025-12-19 12:09:23.770967', 'PENDING', 17052.98999999998, 7),
(6, 'Gikondo', '2025-12-19 12:11:15.437494', 'PENDING', 17052.98999999998, 7),
(7, 'Gikondo', '2025-12-19 13:35:32.635146', 'PENDING', 51.39, 7),
(8, 'Gikondo', '2025-12-19 13:35:35.749635', 'PENDING', 51.39, 7),
(9, 'kacyiru', '2025-12-19 13:59:37.033903', 'DELIVERED', 548.4, 7),
(10, 'Gatsata', '2025-12-20 17:13:15.435507', 'CONFIRMED', 2713.2, 7),
(11, 'kabuga', '2025-12-22 13:24:40.201752', 'CONFIRMED', 14250, 9),
(12, 'Nyabugogo', '2025-12-22 13:37:55.608524', 'ON_THE_WAY', 18100, 10),
(13, 'Nyaugogo', '2025-12-22 17:57:15.490532', 'CONFIRMED', 17550, 9);

-- Test Login Credentials:
-- Customer: adelinetuyizere333@gmail.com (any password)
-- Admin: adelinetuyizere5@gmail.com
-- Restaurant Owner: philbertmusasira3@gmail.com or divyaine086@gmail.com
