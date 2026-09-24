# StockShare

StockShare is a surplus redistribution platform for food and raw materials. Businesses can publish lots that are no longer usable internally, and receivers can claim them for human donation, animal feed, or industrial reuse.

## Features

- Marketplace for surplus lots with filtering and detail pages
- Authenticated emitter and receiver flows
- Reservation and hand-off workflow
- User account management including profile picture and deactivation
- Newsletter and contact form
- Landing page with call-to-action flow and circular economy messaging

## Stack

- Frontend: React 18 + Vite + React Router
- Backend: Node.js + Express
- Database: PostgreSQL
- Authentication: JWT
- File uploads: local disk storage served under /uploads
- Containerization: Docker + Docker Compose

## Repository structure

```text
backend/                 API and database logic
  src/server.js          Express entry point
  src/db.js              PostgreSQL client helper
  src/schema.sql         SQL schema and seed-related defaults
  src/init-db.js         Database init script
  src/routes/            auth, users, lots, misc endpoints
  .env.example           Backend environment example

frontend/                React app
  src/                   App code and styles
  .env.example           Frontend environment example
  vite.config.js         Vite config with API proxy
  Dockerfile             Frontend image

render.yaml              Deployment config
Dockerfile               Optional root-level Docker usage
docker-compose.yml       Local full-stack setup
README.md                Project documentation
```

## Local development

### With Docker (recommended)

From the repository root:

```bash
docker compose up --build
```

Then open:

- Frontend: http://localhost:8080
- API: http://localhost:4000/api/health

The app is already configured so the frontend proxies /api and /uploads to the backend.

### Without Docker

1. Start PostgreSQL

```bash
docker compose up -d db
```

2. Configure the backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:init
npm run dev
```

3. Configure the frontend

```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

Open the app on http://localhost:5173.

## Demo accounts

The seed data includes these users:

- emitter@stockshare.demo / password123
- receiver@stockshare.demo / password123

## Environment variables

Backend example file:

```env
PORT=4000
DATABASE_URL=postgres://stockshare:stockshare@localhost:5432/stockshare
JWT_SECRET=change-me-in-production
PUBLIC_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:5173
```

Frontend example file:

```env
VITE_API_BASE=http://localhost:4000/api
VITE_PUBLIC_SITE_URL=http://localhost:5173
VITE_IMPACT_CO2_KG_PER_KG=2.5
VITE_IMPACT_WATER_M3_PER_KG=0.0015
```

## Build

```bash
cd frontend
npm run build
```

This produces a production bundle in the frontend/dist directory.

## Notes

- The app expects PostgreSQL to be available on port 5432 for local development.
- The frontend uses Vite proxying for /api and /uploads in local development.
- The backend exposes newsletter and contact endpoints under /api.
- The project includes a Render config for deployment, but it is meant to be adapted to the target environment.

## License

This project is for internal/demo use unless a separate license is provided.
