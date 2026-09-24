# StockShare - new version

StockShare is a surplus-food redistribution marketplace. Businesses (emitters) publish surplus
ingredients, and receivers reserve them for human donation, animal feed, or industrial recycling.

## Tech stack

- Front end: React 18 + Vite + React Router (single-page web app, English interface)
- Back end: Node.js + Express REST API with JWT authentication
- Database: PostgreSQL
- File uploads: local disk storage served under /uploads
- Containers: Docker (backend and frontend), Docker Compose for the full stack
- Hosting blueprint: Render free tier (render.yaml) with a free external PostgreSQL

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

## Run it in GitHub Codespaces

Codespaces can run the whole stack, because the repository ships a dev container configuration
that enables Docker inside the codespace.

1. On the repository page choose Code, then Codespaces, then Create codespace on main.
2. Wait for the container to build. Docker and Docker Compose are ready when the terminal appears.
3. In the terminal run: docker compose up --build
4. Open the Ports panel and click the forwarded address for port 8080, or use the "Open in Browser"
   button. Codespaces gives you an address like
   https://your-codespace-name-8080.app.github.dev - that address replaces localhost:8080.
5. To let other people open the site, right click the 8080 port in the Ports panel, choose Port
   Visibility, then Public.

Notes:
- The web container proxies /api to the api container inside the same network, so the site works
  fully through the forwarded address without any CORS setup.
- A personal GitHub account includes 120 core hours and 15 GB-month of Codespaces storage per month.
  The codespace stops when idle and is deleted after a period of inactivity, but the PostgreSQL data
  lives in a Docker volume and survives restarts for as long as the codespace exists.

## Run without Docker

1. Start PostgreSQL (docker compose up -d db).
2. Back end: cd backend, cp .env.example .env, npm install, npm run db:init, npm run dev.
3. Front end: cd frontend, cp .env.example .env, npm install, npm run dev (http://localhost:5173).

## Deploy a public URL for free

The whole stack can run on free plans: a free Render web service for the API, a free Render static
site for the web app, and a free external PostgreSQL. Nothing here needs a paid instance.

What is free and what to expect:
- Render free web service: sleeps after 15 minutes without traffic. The first visit afterwards takes
  roughly 50 seconds to wake up.
- Render static site: always on, no sleeping.
- Free PostgreSQL: Neon (0.5 GB) or Supabase (500 MB). Render's own free database expires 30 days
  after creation, so use an external one if you want it to last.
- Profile photos are stored on the API container's local disk. On a free host that disk is wiped on
  every restart or redeploy, so photos do not survive.

Steps:

1. Create a free PostgreSQL and copy its connection string.
   - Neon: https://neon.tech, create a project, copy the connection string, append sslmode=require.
   - Or Supabase: https://supabase.com, create a project, copy the connection string.

2. Deploy. Sign in to https://render.com with GitHub, choose New, then Blueprint, and select the
   repository ghribiasma11/stockshar-new-version. Render reads render.yaml and offers two resources:
   stockshare-api and stockshare-web.

3. When Render asks for the DATABASE_URL value, paste the connection string from step 1. Confirm.

4. Wait for both resources to report Live. The API creates the tables and demo data on first boot.

5. Open the URL Render shows for stockshare-web. That is your public site.

6. Make the two services talk to each other: in render.yaml set VITE_API_BASE to the API URL plus
   /api, and set CORS_ORIGIN on the API to the static site URL. Commit and push; Render redeploys.

If the blueprint is rejected, create the two resources by hand instead:
- Web Service, Docker, root directory backend, free instance type.
- Static Site, build command cd frontend && npm install && npm run build, publish directory
  frontend/dist, with a rewrite rule from /* to /index.html.

Any other Docker host works too: build backend/Dockerfile and frontend/Dockerfile, point
DATABASE_URL at PostgreSQL, set CORS_ORIGIN to the web URL, and set the VITE_API_BASE build
argument to the public API URL followed by /api.

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
