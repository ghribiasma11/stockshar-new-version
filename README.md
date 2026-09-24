# StockShare - new version

StockShare is a surplus-food redistribution marketplace. Businesses (emitters) publish surplus
ingredients, and receivers reserve them for human donation, animal feed, or industrial recycling.

This repository is a full-stack rebuild of the StockShare app with the requested product changes,
written as clean, runnable code.

## Tech stack

- Front end: React 18 + Vite + React Router (single-page web app, English interface)
- Back end: Node.js + Express REST API with JWT authentication
- Database: PostgreSQL
- File uploads: local disk storage served under /uploads

## Repository layout

~~~
backend/            REST API (Express + PostgreSQL)
  src/schema.sql    Database schema
  src/init-db.js    Creates tables and demo data
  src/routes/       auth, users, lots, newsletter, contact
frontend/           Web app (React + Vite)
docker-compose.yml  Local PostgreSQL service
~~~

## Getting started

1. Start PostgreSQL:

~~~
docker compose up -d
~~~

2. Back end:

~~~
cd backend
cp .env.example .env
npm install
npm run db:init
npm run dev
~~~

3. Front end (new terminal):

~~~
cd frontend
cp .env.example .env
npm install
npm run dev
~~~

The web app runs on http://localhost:5173 and calls the API on http://localhost:4000.

## Demo accounts (created by npm run db:init)

- emitter@stockshare.demo / password123 (emitter)
- receiver@stockshare.demo / password123 (receiver)

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

## Product changes in this version

- The live "Just added" lot now shows Tunis as the location.
- Landing page gained a Newsletter section, a Contact section, a Terms of Use link, and a footer
  with a canonical link.
- Removed the "01 / Circular by design" element from the landing page.
- Sign in and Sign up now require accepting the Terms of Use and the Privacy Policy.
- Users can log out, edit their profile, change their profile photo, deactivate their account,
  or permanently delete their account.
- Emitters cannot reserve their own lots, so the Reserve button is hidden for the lot owner.
- All buttons carry visible text labels.
