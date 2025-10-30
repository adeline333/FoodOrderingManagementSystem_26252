# Online Food Ordering System — Single Restaurant Model

A full-stack **Spring Boot** backend project for managing online food orders from a single restaurant.  
It includes user management, location hierarchy (Province → Village), menu management, order handling, and secure payment recording.

---

## Project Overview

This system allows customers to browse menu items, place orders, and make payments.  
Admins can manage users, orders, menu items, and track transactions efficiently.

### Core Features

- **Full CRUD** for all main entities (User, MenuItem, Order, OrderItem, Payment)
- **Location Hierarchy** (Province → District → Sector → Cell → Village)
- **Payment Integration** — One-to-One with orders
- **Menu Filtering** — by category, price range, name, etc.
- **Order Management** — includes order items, total amount, and delivery address
- **Pagination & Search APIs** for better data handling
- **User Roles** (Admin, Customer) using enum-based control
