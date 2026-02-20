FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY . .

RUN chmod +x .docker/entrypoint.sh

ENTRYPOINT [ "sh", ".docker/entrypoint.sh" ]
