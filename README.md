# RTROM Full-Stack Skeleton

This repository contains a minimal full-stack setup:
- Backend: Spring Boot 3.x, Java 21, Maven
- Frontend: React 18 + Vite + TailwindCSS + React Router + Zustand

## Setup Commands

### 1) Backend (Spring Boot)

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend runs on: `http://localhost:8080`

### 2) Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 3) Default Admin
Email:- admin@rtrom.com
Password:- admin123


## Frontend Dependencies Installed via package.json
- react-router-dom
- axios
- zustand
- tailwindcss

## Notes
- This is boilerplate only. No business logic has been implemented.
- Update database and JWT values in `backend/src/main/resources/application.yml` before production use.
