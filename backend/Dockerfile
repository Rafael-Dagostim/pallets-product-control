FROM node:22-alpine AS base

WORKDIR /app

COPY . .

RUN chmod +x .docker/entrypoint.sh

ENTRYPOINT [ "sh", ".docker/entrypoint.sh" ]
