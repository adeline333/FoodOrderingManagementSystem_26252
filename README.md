# Food Ordering Management System

### [Click Here to Open the Live Demo](https://food-ordering-system-git-main-adelinetuyizere333-9455s-projects.vercel.app/)

**Live Website:** https://food-ordering-system-git-main-adelinetuyizere333-9455s-projects.vercel.app/

[![Live Demo](https://img.shields.io/badge/Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://food-ordering-system-git-main-adelinetuyizere333-9455s-projects.vercel.app/)
[![Backend API](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://online-food-ordering-backend-6s7l.onrender.com/health)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.7-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

> **Live Application:** [https://food-ordering-system-git-main-adelinetuyizere333-9455s-projects.vercel.app/](https://food-ordering-system-git-main-adelinetuyizere333-9455s-projects.vercel.app/)  
> **Backend REST API:** [https://online-food-ordering-backend-6s7l.onrender.com/](https://online-food-ordering-backend-6s7l.onrender.com/)  
> **Note on OTP Testing:** 2FA verification codes are sent to your email and also automatically pre-filled on screen so testing can continue without delay even if mail services encounter network blocks.

---

A full-stack multi-restaurant food ordering and management platform built with Spring Boot 3, React 18, Vite, Tailwind CSS, and PostgreSQL. The application supports multi-vendor storefronts, category-based food browsing, role-based access control (RBAC), Rwandan administrative location hierarchy, and two-factor OTP verification.

---

## Dual OTP Verification (Email and Instant Pre-Fill)

The system features two-factor authentication (OTP) for logins, new registrations, and password resets:

1. **Sent Directly to Email:** The backend automatically dispatches a 6-digit OTP code to the recipient's email address upon request.
2. **On-Screen Auto-Fill:** Simultaneously, the code is pre-filled directly into the input boxes on screen alongside a testing notice.
3. **Fault-Tolerant Delivery:** In the event that an email server is delayed, offline, or blocked by cloud hosting firewall policies (such as Render's outbound SMTP restrictions), users are never trapped and can verify immediately to continue using the application.

### Getting Started and Account Registration

Visitors can create an account directly on the live platform:

1. Click **Create an account** on the login page or navigation bar.
2. Select your desired role (**Customer**, **Restaurant Owner**, **Delivery Person**, or **Admin**).
3. Fill in your details and Rwandan location hierarchy (Province, District, Sector, Cell, Village).
4. Verify your account using the instant on-screen OTP code or click skip to navigate directly to your dashboard.

---

## Key Features

### Customer Portal
- **Multi-Restaurant Marketplace:** Discover kitchens across Kigali (Philbert's Kitchen, Divine Delights, Trust Restaurant).
- **Food Catalog:** Filter dishes by categories (All Dishes, Main Courses, Appetizers, Sides, Desserts, Beverages).
- **Search:** Search dishes and restaurants in real time.
- **Cart and Orders:** Add items to cart from any restaurant, view summary totals, and track delivery progress (PENDING, CONFIRMED, PREPARING, ON_THE_WAY, DELIVERED).

### Restaurant Owner Portal
- **Kitchen Dashboard:** View incoming orders, revenue statistics, and delivery progress.
- **Menu Management:** Add, update, or remove menu items with images, descriptions, categories, and prices.
- **Order Management:** Update order statuses as meals are prepared and dispatched.

### Administrator Portal
- **System Metrics:** High-level platform statistics on total orders, revenue volume, and active users.
- **User and Restaurant Administration:** Manage accounts and monitor platform operations.

### Location Hierarchy
- Integrated Rwandan administrative structure: **Provinces -> Districts -> Sectors -> Cells -> Villages** stored directly in the database for delivery addresses.

---

## Architecture and Tech Stack

```
FoodOrderingManagementSystem/
├── OnlineFoodOrdering/                   # Spring Boot Backend (Java 22, Maven, Docker)
│   ├── src/main/java/com/example/OnlineFoodOrdering/
│   │   ├── config/                       # SecurityConfig, DataSeeder, JacksonConfig
│   │   ├── controller/                   # REST Controllers (Auth, Restaurant, MenuItem, Order, etc.)
│   │   ├── dto/                          # Auth requests, Responses, Search DTOs
│   │   ├── entity/                       # JPA Entities (User, Restaurant, MenuItem, Order, Location)
│   │   ├── repository/                   # Spring Data JPA Repositories
│   │   └── service/                      # Business logic and EmailService
│   ├── Dockerfile                        # Multi-stage optimized Docker build for Render
│   └── pom.xml
└── OnlineFoodOrdering_frontend/          # React 18 SPA (Vite + Tailwind CSS)
    └── food_ordering_mgt_system/
        ├── src/
        │   ├── components/               # Navbar, Topbar, Modals, Buttons
        │   ├── context/                  # AuthContext, CartContext
        │   ├── layouts/                  # MainLayout, AuthLayout
        │   ├── pages/                    # Dashboard, Restaurants, Menu, Orders, Auth
        │   └── services/                 # Axios API clients
        ├── package.json
        └── vite.config.js
```

- **Backend:** Java 22, Spring Boot 3.5.7, Spring Security (JWT), Spring Data JPA, Hibernate ORM
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Axios, React Hot Toast
- **Database:** PostgreSQL (with connection pooling tuned for 512MB RAM cloud containers)
- **Deployment:** Docker container on Render (Backend) + Vercel CDN (Frontend)

---

## Local Development Setup

### Prerequisites
- Java 17+ (Java 22 recommended)
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/adeline333/FoodOrderingManagementSystem_26252.git
cd FoodOrderingManagementSystem_26252
```

### 2. Configure and Run Backend
1. Create a PostgreSQL database named `food_ordering_DB`:
   ```sql
   CREATE DATABASE food_ordering_DB;
   ```
2. Navigate to the backend directory:
   ```bash
   cd OnlineFoodOrdering
   ```
3. Update `src/main/resources/application.properties` with your PostgreSQL credentials:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/food_ordering_DB
   spring.datasource.username=postgres
   spring.datasource.password=your_password
   jwt.secret=your_super_secret_jwt_key_at_least_256_bits_long
   ```
4. Build and start the backend:
   ```bash
   ./mvnw spring-boot:run
   ```
   The backend will start on `http://localhost:8080` and seed initial restaurants and menu items.

### 3. Configure and Run Frontend
1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd OnlineFoodOrdering_frontend/food_ordering_mgt_system
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

---

## REST API Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user and trigger OTP | Public |
| `POST` | `/api/auth/login` | Authenticate and trigger 2FA OTP | Public |
| `POST` | `/api/auth/verify-login-otp` | Verify OTP and receive JWT token | Public |
| `GET` | `/api/restaurants` | List all active restaurants | Public |
| `GET` | `/api/restaurants/{id}` | Get restaurant details | Public |
| `GET` | `/api/menu-items` | Get all food menu items | Public |
| `GET` | `/api/menu-items/category/{cat}` | Filter food by category | Public |
| `POST` | `/api/orders` | Create a new food order | Authenticated |
| `GET` | `/api/orders/customer/{id}` | Get customer order history | Authenticated |
| `GET` | `/api/locations/provinces` | List Rwandan provinces | Public |
| `GET` | `/health` | Cloud deployment health check | Public |

---

## Database Schema and ERD

The database architecture models the relationships between users, restaurants, menu items, orders, order items, payments, and the hierarchical administrative location structure.

The Entity Relationship Diagram (ERD) is located at:
[`OnlineFoodOrdering/src/main/java/com/example/OnlineFoodOrdering/assets/ERD food mgt.png`](./OnlineFoodOrdering/src/main/java/com/example/OnlineFoodOrdering/assets/ERD%20food%20mgt.png)

---

## Author

**Adeline Tuyizere**
- **GitHub:** [@adeline333](https://github.com/adeline333)
- **Repository:** [FoodOrderingManagementSystem_26252](https://github.com/adeline333/FoodOrderingManagementSystem_26252)
