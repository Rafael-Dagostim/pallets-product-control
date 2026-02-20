#!/bin/bash

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

pnpm install

pnpm exec prisma migrate dev --name init
pnpm exec prisma generate

pnpm run start:dev
