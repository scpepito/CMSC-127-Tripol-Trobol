# CMSC 127 - Tripol Trobol

Full-stack app:
- Frontend: React + Vite + Tailwind (`/`)
- Backend: Express + MariaDB (`/server`)

## Quick start (recommended)

You’ll run **3 things**: MariaDB, the API server, and the Vite web app.

### 0) Prerequisites

- Node.js (LTS recommended) + npm
- MariaDB (or MySQL) running locally

### 1) Install dependencies

In the project root:

```bash
npm install
```

In `server/`:

```bash
cd server
npm install
```

### 2) Configure environment variables

Create `server/.env` based on `server/.env.example`. 

Edit `server/.env` and set your DB credentials.

Note: `server/.env` is gitignored

### 3) Initialize the database

This runs `server/db/schema.sql` (creates the DB + tables + seed data).

```bash
cd server
npm run db:init
```

### 4) Run the backend (API)

```bash
cd server
npm run dev
```

API runs on `http://localhost:3001` by default.

### 5) Run the frontend (web app)

In a new terminal, from the project root:

```bash
npm run dev
```

Vite runs on `http://localhost:5173` by default.

## Environment variables

### Backend (`server/.env`)

See `server/.env.example` for the full list.

- `PORT` (default: `3001`)
- `CORS_ORIGIN` (default: `http://localhost:5173`)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

### Frontend (`.env` optional)

The frontend talks to the API at `http://localhost:3001` by default.