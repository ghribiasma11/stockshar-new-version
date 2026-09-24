# StockShare - new version

StockShare is a surplus-food redistribution marketplace. Businesses (emitters) publish surplus
ingredients, and receivers reserve them for human donation, animal feed, or industrial recycling.

## Tech stack

- Front end: React 18 + Vite + React Router (single-page web app, English interface)
- Back end: Node.js + Express REST API with JWT authentication
- Database: PostgreSQL
- File uploads: local disk storage served under /uploads
- Containers: Docker (backend and frontend), Docker Compose for the full stack
- Hosting blueprint: Render (render.yaml)

## Repository layout

~~~
backend/            REST API (Express + PostgreSQL), Dockerfile
  src/schema.sql    Database schema
  src/init-db.js    Creates tables and demo data (safe to run repeatedly)
  src/routes/       auth, users, lots, newsletter, contact
frontend/           Web app (React + Vite), Dockerfile and nginx.conf
docker-compose.yml  Local PostgreSQL + API + web app
render.yaml         Managed PostgreSQL + two web services
~~~

## Run everything with one command

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

## Deploy to a public URL with Render

Render reads render.yaml from the repository and creates the database and both services.

1. Push this repository to GitHub (already done) and sign in to https://render.com.
2. Choose New, then Blueprint, and pick the repository ghribiasma11/stockshar-new-version.
3. Render shows the three resources from render.yaml. Confirm and apply.
   - stockshare-db: managed PostgreSQL
   - stockshare-api: the REST API container
   - stockshare-web: the web app container
4. Wait for both services to report Live. The API runs the schema and demo data on first boot.
5. Open the URL Render shows for stockshare-web, for example https://stockshare-web.onrender.com.
6. Replace the two placeholder hostnames in render.yaml with the real URLs Render assigned
   (the VITE_API_BASE of the web service and the CORS_ORIGIN of the api service), commit, and push.
   Render redeploys automatically.

Any other Docker host works the same way: build backend/Dockerfile and frontend/Dockerfile,
point DATABASE_URL at a PostgreSQL instance, set CORS_ORIGIN to the web URL, and set the
VITE_API_BASE build argument to the public API URL followed by /api.

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

## Product behaviour

- The live "Just added" lot shows Tunis as the location.
- The landing page has a Newsletter section, a Contact section, a Terms of Use link and a footer
  with a canonical link.
- Sign in and Sign up require accepting the Terms of Use and the Privacy Policy.
- Users can log out, edit their profile, change their profile photo, deactivate their account or
  permanently delete it.
- Emitters cannot reserve their own lots, so the Reserve button is hidden for the lot owner.
- All buttons carry visible text labels.
