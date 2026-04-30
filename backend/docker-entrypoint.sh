#!/bin/sh
set -e

echo "==> Aplicando migrations..."
npx prisma migrate deploy

echo "==> Rodando seed (idempotente)..."
node dist/src/prisma/seed.js || echo "Seed falhou ou já aplicado, seguindo."

echo "==> Iniciando servidor..."
exec node dist/src/main
