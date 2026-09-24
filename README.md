# StockShare - new version

StockShare is a surplus-food redistribution marketplace. Businesses (emitters) publish surplus
ingredients, and receivers reserve them for human donation, animal feed, or industrial recycling.

## Tech stack

- Front end: React 18 + Vite + React Router (single-page web app, English interface)
- Back end: Node.js + Express REST API with JWT authentication
- Database: PostgreSQL
- File uploads: local disk storage served under /uploads
- Containers: Docker (backend and frontend), Docker Compose for the full stack


## Repository layout

~~~
backend/            REST API (Express + PostgreSQL), Dockerfile
  src/schema.sql    Database schema
  src/init-db.js    Creates tables and demo data (safe to run repeatedly)
  src/routes/       auth, users, lots, newsletter, contact
frontend/           Web app (React + Vite), Dockerfile and nginx.conf
.devcontainer/      Codespaces / VS Code container with Docker enabled
docker-compose.yml  PostgreSQL + API + web app
render.yaml         Free hosting blueprint
~~~

## Run everything locally, free, with one command

~~~
docker compose up --build
~~~

Then open http://localhost:8080. The web container serves the app and proxies /api and /uploads
to the api container. The api container creates the tables and demo data on start.

Demo accounts:
- emitter@stockshare.demo / password123 (emitter)
- receiver@stockshare.demo / password123 (receiver)


## Run without Docker

1. Start PostgreSQL (docker compose up -d db).
2. Back end: cd backend, cp .env.example .env, npm install, npm run db:init, npm run dev.
3. Front end: cd frontend, cp .env.example .env, npm install, npm run dev (http://localhost:5173).



## REST API

Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET  /api/auth/me

Account and profile
- PUT    /api/users/me
- POST   /api/users/me/photo
- POST   /api/users/me/deactivate
- POST   /api/users/me/reactivate
- DELETE /api/users/me

Lots
- GET  /api/lots
- GET  /api/lots/:id
- POST /api/lots
- POST /api/lots/:id/reserve

Other
- POST /api/newsletter
- POST /api/contact
- GET  /api/health


