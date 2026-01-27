FROM node:20-alpine AS build-stage
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:20-alpine AS production-stage
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=8080

COPY --from=build-stage /app/.next/standalone ./
COPY --from=build-stage /app/.next/static ./.next/static
COPY --from=build-stage /app/public ./public

EXPOSE 8080
CMD ["node", "server.js"]
