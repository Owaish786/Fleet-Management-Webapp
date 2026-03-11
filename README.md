# Fleet Management Web App

A production-minded full-stack fleet management starter built from scratch with React, Node.js, Express, Prisma, and PostgreSQL.

## Stack

- React 19 + Vite + TypeScript for the UI
- Node.js + Express + TypeScript for the API
- Prisma ORM with PostgreSQL
- Docker Compose for local database startup

## Workspace layout

```text
.
├── apps
│   ├── api
│   └── web
├── prisma
├── .env.example
└── docker-compose.yml
```

## Features included

- Dashboard summary with charts for fleet utilization and recent route activity
- Vehicle, driver, trip, and maintenance views
- Create flows for vehicles, drivers, trips, and maintenance records
- Prisma schema and seed data for the core fleet domain
- Clean monorepo scripts for development, build, and database commands

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Start PostgreSQL:

   ```bash
   docker compose up -d
   ```

4. Generate the Prisma client, apply the schema, and seed sample data:

   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

The frontend runs on `http://localhost:5173` and the API runs on `http://localhost:4000`.

## Useful scripts

- `npm run dev` starts the frontend and backend together
- `npm run build` builds both workspaces
- `npm run lint` runs workspace linters
- `npm run db:generate` generates the Prisma client
- `npm run db:migrate` creates or applies database migrations
- `npm run db:seed` loads demo fleet data