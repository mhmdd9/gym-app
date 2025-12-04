# Gym Booking SaaS

A modular monolith booking system for gyms in Iran.

## Project Structure

```
/gym-app
  /backend    <- Spring Boot (API, DB, modules)
  /frontend   <- React PWA (TypeScript + Tailwind)
```

## Tech Stack

### Backend
- Java 17+ with Spring Boot 3.x
- Spring Security (JWT + OTP Authentication)
- Spring Data JPA
- PostgreSQL
- Maven (Multi-module)

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit
- PWA Support

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 15+

### Backend Setup
```bash
cd backend
./mvnw spring-boot:run -pl app
```

Or on Windows:
```bash
cd backend
mvnw.cmd spring-boot:run -pl app
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Modules

| Module       | Responsibility                                      |
|--------------|-----------------------------------------------------|
| auth         | User registration, login (OTP), JWT, roles          |
| user         | User profile, booking history                       |
| club         | Gym info, trainers, activity definitions            |
| booking      | Reservations, class sessions, capacity management   |
| payment      | On-site payment recording                           |
| notification | SMS and push notifications                          |
| common       | Shared utilities, config, exception handling        |

## API Versioning

All APIs are versioned: `/api/v1/...`

## License

Proprietary - All rights reserved.

