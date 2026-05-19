# CMSC 127 - LTO Information Management System

This project is a LTO information management system for CMSC 127: File Processing and Database Systems, developed by the Tripol Trobol. It manages drivers, vehicles, vehicle registrations, traffic violations, and generated reports through a React web app backed by an Express API and MariaDB database.

## Tech Stack

Frontend:
- ReactJS
- Tailwind CSS

Backend:
- Node.js
- Express

## Project Structure

- `src/` - React frontend, pages, reusable components, API clients, and helpers
- `server/` - Express API, routes, controllers, validators, and database scripts
- `server/db/schema.sql` - database schema and seed setup

## How To Run

Prerequisites:
- Node.js LTS and npm
- MariaDB or MySQL running locally

Install frontend dependencies from the project root:

```bash
npm install
```

Install backend dependencies:

```bash
cd server
npm install
```

Create the backend environment file:

```bash
cp .env.example .env
```

Edit `server/.env` with your local database credentials:

```env
PORT=3001
CORS_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=tripol_trobol
```

Initialize the database from inside `server/`:

```bash
npm run db:init
```

Start the backend API from inside `server/`:

```bash
npm run dev
```

Start the frontend from the project root in a second terminal:

```bash
npm run dev
```

Open the app at `http://localhost:5173`. The API runs at `http://localhost:3001` by default.

## Useful Commands

Frontend:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

Backend:

```bash
cd server
npm run db:init
npm run dev
npm start
```

Optional frontend API override:

```env
VITE_API_BASE_URL=http://localhost:3001
```
