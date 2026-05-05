# LuxeStay - Premium Rental Platform

This project includes a Next.js frontend and a Django REST Framework backend with PostgreSQL, adhering to the premium design system requested.

## Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL (or Docker)

## Backend Setup (Django)

1. **Start the Database**
If you have Docker installed, you can start the PostgreSQL instance with:
```bash
docker compose up -d
```
Alternatively, configure your local PostgreSQL with:
- DB_NAME: luxestay
- DB_USER: postgres
- DB_PASSWORD: postgres

2. **Run Migrations**
```bash
cd backend
source ../venv/bin/activate
python manage.py makemigrations accounts
python manage.py migrate
```

3. **Start the Development Server**
```bash
python manage.py runserver
```

## Frontend Setup (Next.js)

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Start the Frontend Development Server**
```bash
npm run dev
```

Navigate to `http://localhost:3000` to see the site.
The login and signup is available at `http://localhost:3000/auth`!
