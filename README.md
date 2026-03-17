# Fleet Management Web App

A production-minded full-stack fleet management starter built from scratch with React, Node.js, Express, Prisma, and PostgreSQL.

## Stack

- React 19 + Vite + TypeScript for the UI
- Node.js + Express + TypeScript for the API
- Prisma ORM with PostgreSQL
- Docker Compose for local database startup
- Recharts for dashboard analytics visualization
- AWS-ready integration for S3 analytics exports and Lambda analytics execution

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
- Predictive analytics endpoint with:
   - Fuel consumption trend forecasting
   - Abnormal driver behavior detection from tracking pings
   - Route optimization candidates from historical trip performance
   - Maintenance risk scoring and service recommendations
- Vehicle, driver, trip, and maintenance views
- Create flows for vehicles, drivers, trips, and maintenance records
- Prisma schema and starter seed data (drivers + demo operator account)
- Live tracking foundation is present in the API/web stack; full real-world live tracking will be available after the planned mobile app client is implemented
- Clean monorepo scripts for development, build, and database commands

## Analytics and cloud endpoints

- GET /api/analytics/insights: Returns decision intelligence payload for dashboard and data science workflows.
- POST /api/analytics/insights/export-s3: Generates a fresh analytics snapshot and stores it in S3.
- POST /api/analytics/logs/export-s3: Uploads local API access logs to S3 as NDJSON.

Both endpoints are authenticated and use the existing JWT auth middleware.

When AWS_LAMBDA_ANALYTICS_FUNCTION is configured, /api/analytics/insights automatically invokes Lambda and returns the Lambda analytics payload instead of local in-process computation.

## AWS deployment path

See [AWS-SETUP.md](./AWS-SETUP.md) for detailed instructions on configuring your AWS credentials, S3 buckets, and Lambda functions.

1. Store application and tracking logs in S3 using the export endpoint and bucket lifecycle rules.
2. Run analytics in Lambda by packaging the handler at apps/api/src/lambda/analytics-handler.ts.
3. Run PostgreSQL on RDS and deploy API + dashboard on EC2 (or ECS) with VITE_API_URL pointed to your API domain.

Optional environment variables for cloud export:

- AWS_REGION
- AWS_S3_ANALYTICS_BUCKET
- AWS_S3_LOGS_BUCKET
- AWS_LAMBDA_ANALYTICS_FUNCTION

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
- `npm run db:seed` resets data and loads seeded drivers only