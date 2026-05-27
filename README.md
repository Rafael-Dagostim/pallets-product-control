# Pallets Product Control

Sistema de controle de produção de paletes — gerencia colaboradores, tipos de
palete (com versionamento e custos), histórico de produção, clientes, pedidos e
relatórios/folha de pagamento.

Monorepo com **API REST em NestJS** (Prisma 7 + PostgreSQL) e **frontend em
Next.js** (shadcn/ui + Tailwind).

## Funcionalidades

- **Autenticação JWT** com `login` em maiúsculas + senha (access token curto +
  refresh token de tipo separado).
- **Controle de acesso por papel**: `ADMIN`, `MANAGER`, `EMPLOYEE`
  (deny-by-default no backend + navbar/rotas guardadas no frontend).
- **Paletes**: catálogo com versionamento (auto-FK) e precificação
  (compra / produção / venda).
- **Produção**: registro de quanto cada colaborador produziu, com workflow de
  status (`OPEN → VERIFIED → PAID/CANCELED`); colaborador só vê os próprios
  registros.
- **Clientes & Pedidos**: pedidos com itens (quantidade pedida vs. produzida) e
  workflow de status.
- **Relatórios & folha de pagamento** por período/colaborador.
- **Soft delete** em todas as entidades (`deletedAt`).

## Stack

| Camada    | Tecnologias |
|-----------|-------------|
| Backend   | NestJS, Prisma 7, PostgreSQL, Passport-JWT, class-validator, Helmet, @nestjs/throttler |
| Frontend  | Next.js, React, shadcn/ui, Tailwind CSS, react-hook-form, Zod |
| Infra dev | Docker Compose, npm |

## Estrutura

```
.
├── backend/    # API NestJS (Prisma + PostgreSQL)
│   ├── src/
│   │   ├── auth/        # JWT, guards (JwtAuthGuard global, RoleGuard), strategies
│   │   ├── core/        # PrismaService
│   │   ├── modules/     # users, pallets, customers, orders, order-items,
│   │   │                #   production-history, reports
│   │   └── shared/      # decorators (@IsPublic, @Roles, @User), exceptions
│   └── prisma/          # schema + migrations
└── frontend/   # App Next.js (app router)
    └── src/
        ├── app/         # rotas (login + dashboard)
        ├── components/  # ui (shadcn), layout, shared
        ├── services/    # client da API
        ├── contexts/    # auth
        └── hooks/
```

## Como rodar (desenvolvimento)

### Pré-requisitos

- Node 20+
- Docker + Docker Compose (para o PostgreSQL)

### Backend

```bash
cd backend
cp .env.example .env          # ajuste os valores (veja abaixo)
npm install
docker compose up -d          # sobe PostgreSQL
npx prisma migrate dev        # aplica migrations
npx prisma generate           # gera o client (em src/generated/prisma)
npm run start:dev             # http://localhost:3000  (Swagger em /docs)
```

### Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:3000 (ajuste a porta se necessário)
```

> Configure `NEXT_PUBLIC_API_URL` apontando para a API.

## Variáveis de ambiente (backend)

Use `backend/.env.example` como base. **Os valores do exemplo são apenas para
desenvolvimento local — gere segredos próprios em produção** (ex.:
`openssl rand -hex 32`).

| Variável              | Descrição                                  |
|-----------------------|--------------------------------------------|
| `PORT`                | Porta da API                               |
| `DATABASE_URL`        | String de conexão do PostgreSQL            |
| `JWT_SECRET`          | Segredo para assinar os JWT                |
| `PWD_PEPPER`          | Pepper aplicado às senhas antes do bcrypt  |
| `SEED_ADMIN_PASSWORD` | Senha do admin criado pelo seed            |
| `CORS_ORIGIN`         | Origem(ns) permitida(s) no CORS            |

## Scripts úteis (backend)

```bash
npm run start:dev    # dev com hot reload
npm run build        # compila para dist/
npm run test         # testes unitários (Jest)
npm run lint         # ESLint
npx prisma studio    # GUI do banco
```

## Testes

Os testes ficam ao lado dos arquivos como `*.spec.ts`. Rode `npm run test` em
`backend/`.

## Modelo de domínio

- **User** — colaboradores com papéis (ADMIN, MANAGER, EMPLOYEE), identificados por `login`.
- **Pallet** — tipos de palete com versionamento e custos.
- **ProductionHistory** — produção por colaborador, com status.
- **Customer / Order / OrderItem** — clientes e pedidos com seus itens.
- **ReportTemplate** — modelos de relatório.
