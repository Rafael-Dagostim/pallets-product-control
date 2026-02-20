#!/bin/bash

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

pnpm install

pnpm exec prisma migrate dev
pnpm exec prisma generate

pnpm run start:dev
