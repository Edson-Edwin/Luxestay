# LuxeStay Project Report (Advanced)

## 1. Executive Summary
LuxeStay is a high-end, premium property rental platform designed to provide a seamless experience for both property owners (hosts) and guests. The platform focuses on luxury listings, flexible pricing models, and a modern, high-performance user interface. Built with scalability in mind, it utilizes a decoupled architecture with a Django REST Framework backend and a Next.js frontend.

---

## 2. Technical Architecture

### 2.1 Backend (Django REST Framework)
- **Framework**: Django 6.0+ with Django REST Framework (DRF).
- **Authentication**: JWT (JSON Web Tokens) using `rest_framework_simplejwt` with Secure Cookie support.
- **Database**: **MySQL 8.0 / MariaDB** (Production) integrated via **PyMySQL**.
- **Environment Management**: Robust configuration using `python-dotenv`.
- **Key Modules**: 
  - `accounts`: Granular RBAC (Role-Based Access Control) for Normal Users, Owners, and Admins.
  - `properties`: Advanced booking engine with multi-tiered pricing and real-time availability management.

### 2.2 Frontend (Next.js)
- **Framework**: Next.js 14/15+ (App Router) for Server-Side Rendering (SSR) and Optimized Performance.
- **Styling**: Vanilla CSS & Tailwind CSS with a curated design system (Stitch-inspired).
- **State Management**: React Context API & Hooks for responsive UI state.
- **Visuals**: Dynamic hero backgrounds, glassmorphism components, and smooth Framer Motion-style animations.

---

## 3. Core Features

### 3.1 Flexible Property Pricing Matrix
LuxeStay implements a unique 3D pricing matrix, allowing owners to toggle availability and set rates for:
- **Nightly**: Short-term stay calculations.
- **Daily**: Day-use rental logic.
- **Monthly**: Long-term lease automation.

### 3.2 Tiered Room Categorization
Properties are not monolithic; they support multiple room types with dynamic pricing overrides:
- **Dormitory**: High-density, budget-friendly shared spaces.
- **Double**: Standard luxury accommodation.
- **Single**: Premium privacy-focused units.

### 3.3 Intelligent Booking Engine
- **Check-in/Out Logic**: Automatic calculation of duration and cost.
- **Room Selection**: Real-time availability checks per category.
- **Financial Security**: Configurable advance payment system to mitigate no-shows.
- **Availability Toggle**: Instant platform-wide visibility control for owners.

---

## 4. System Schema & Data Flow

```mermaid
erDiagram
    USER ||--o{ PROPERTY : owns
    USER ||--o{ BOOKING : makes
    PROPERTY ||--o{ ROOMTYPE : contains
    PROPERTY ||--o{ BOOKING : receives
    ROOMTYPE ||--o{ BOOKING : selected_in
```

### 4.1 Key Data Models
- **User**: Custom user model with `role` (NORMAL, OWNER, ADMIN) and profile metadata.
- **Property**: Core entity storing location data, global pricing, and availability flags.
- **RoomType**: Relational model providing granular pricing overrides for specific property sections.
- **Booking**: Transactional record linking users, properties, and specific room categories with date-range logic.

---

## 5. API Ecosystem (RESTful Endpoints)

| Category | Endpoint | Method | Security | Description |
|----------|----------|--------|----------|-------------|
| **Auth** | `/api/auth/register/` | `POST` | Public | User onboarding |
| **Auth** | `/api/auth/login/` | `POST` | Public | JWT Token issuance |
| **Properties** | `/api/properties/` | `GET/POST` | Mixed | List or curate properties |
| **Booking** | `/api/properties/bookings/` | `POST` | Auth | Secure reservation submission |
| **Admin** | `/api/auth/users/` | `GET` | Admin | System-wide user audit |

---

## 6. Deployment & DevOps

### 6.1 Containerization (Docker)
The project is fully containerized for consistent development and production environments.
- **`backend/Dockerfile`**: Optimized Python-slim image with MySQL client dependencies.
- **`frontend/Dockerfile`**: Multi-stage build for minimal production bundle size.
- **`docker-compose.yml`**: Orchestrates MySQL, Backend, and Frontend services with persistent volumes.

### 6.2 Environment Security
All sensitive configurations (DB credentials, Secret Keys, API URLs) are managed via a centralized `.env` system, excluded from version control for maximum security.

---

## 7. Setup & Installation

### 7.1 Manual (Development)
1. **Backend**: 
   - `python -m venv venv && source venv/bin/activate`
   - `pip install -r requirements.txt`
   - Setup `.env` and run `python manage.py migrate`
2. **Frontend**:
   - `npm install`
   - `npm run dev`

### 7.2 Docker (Production-Ready)
```bash
docker-compose up --build
```

---

## 8. Recent Milestone Updates (May 2026)
- **Database Migration**: Successfully transitioned from SQLite to **MySQL/MariaDB** for enterprise-grade data handling.
- **Pricing Overhaul**: Implemented category-specific pricing logic for diverse room types.
- **DevOps Integration**: Added full **Docker support** for both frontend and backend.
- **UI Refinement**: Integrated advanced date-logic and real-time price calculators in the booking panel.

---
*LuxeStay Technical Report v2.1 | Last Updated: 2026-05-02*
