# Pallets Product Control

Pallet production control system — manages employees, pallet types (with
versioning and costs), production history, customers, orders, and
reports/payroll.

Monorepo with a **NestJS REST API** (Prisma 7 + PostgreSQL) and a **Next.js
frontend** (shadcn/ui + Tailwind).

## Features

- **JWT authentication** with an uppercase `login` + password (short-lived
  access token + a distinctly-typed refresh token).
- **Role-based access control**: `ADMIN`, `MANAGER`, `EMPLOYEE` (deny-by-default
  on the backend + role-gated navbar/routes on the frontend).
- **Pallets**: catalog with versioning (self-referencing FK) and pricing
  (buy / production / sell).
- **Production**: tracks how much each employee produced, with a status workflow
  (`OPEN → VERIFIED → PAID/CANCELED`); employees only see their own records.
- **Customers & Orders**: orders with line items (requested vs. produced
  quantity) and a status workflow.
- **Reports & payroll** by period/employee.
- **Soft deletes** on every entity (`deletedAt`).

## Tech Stack

| Layer       | Technologies |
|-------------|--------------|
| Backend     | NestJS, Prisma 7, PostgreSQL, Passport-JWT, class-validator, Helmet, @nestjs/throttler |
| Frontend    | Next.js, React, shadcn/ui, Tailwind CSS, react-hook-form, Zod |
| Dev infra   | Docker Compose, npm |

## Structure

```
.
├── backend/    # NestJS API (Prisma + PostgreSQL)
│   ├── src/
│   │   ├── auth/        # JWT, guards (global JwtAuthGuard, RoleGuard), strategies
│   │   ├── core/        # PrismaService
│   │   ├── modules/     # users, pallets, customers, orders, order-items,
│   │   │                #   production-history, reports
│   │   └── shared/      # decorators (@IsPublic, @Roles, @User), exceptions
│   └── prisma/          # schema + migrations
└── frontend/   # Next.js app (app router)
    └── src/
        ├── app/         # routes (login + dashboard)
        ├── components/  # ui (shadcn), layout, shared
        ├── services/    # API client
        ├── contexts/    # auth
        └── hooks/
```

## Getting Started (development)

### Prerequisites

- Node 20+
- Docker + Docker Compose (for PostgreSQL)

### Backend

```bash
cd backend
cp .env.example .env          # adjust the values (see below)
npm install
docker compose up -d          # start PostgreSQL
npx prisma migrate dev        # apply migrations
npx prisma generate           # generate the client (into src/generated/prisma)
npm run start:dev             # http://localhost:3000  (Swagger at /docs)
```

### Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:3000 (adjust the port if needed)
```

> Set `NEXT_PUBLIC_API_URL` to point at the API.

## Environment Variables (backend)

Use `backend/.env.example` as a starting point. **The example values are for
local development only — generate your own secrets in production** (e.g.
`openssl rand -hex 32`).

| Variable              | Description                                |
|-----------------------|--------------------------------------------|
| `PORT`                | API port                                   |
| `DATABASE_URL`        | PostgreSQL connection string               |
| `JWT_SECRET`          | Secret used to sign JWTs                    |
| `PWD_PEPPER`          | Pepper applied to passwords before bcrypt   |
| `SEED_ADMIN_PASSWORD` | Password for the admin created by the seed |
| `CORS_ORIGIN`         | Allowed CORS origin(s)                      |

## Useful Scripts (backend)

```bash
npm run start:dev    # dev with hot reload
npm run build        # compile to dist/
npm run test         # unit tests (Jest)
npm run lint         # ESLint
npx prisma studio    # database GUI
```

## Testing

Tests live next to their source files as `*.spec.ts`. Run `npm run test` inside
`backend/`.

## Domain Model

- **User** — employees with roles (ADMIN, MANAGER, EMPLOYEE), identified by `login`.
- **Pallet** — pallet types with versioning and costs.
- **ProductionHistory** — per-employee production, with status.
- **Customer / Order / OrderItem** — customers and orders with their line items.
- **ReportTemplate** — report templates.
