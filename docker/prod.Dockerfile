##### DEPENDENCIES

FROM node:22.21-alpine3.22 AS deps
RUN apk add --no-cache libc6-compat 
RUN apk update && apk upgrade openssl
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY ./patches ./patches

RUN corepack enable && corepack install
RUN pnpm install --shamefully-hoist --strict-peer-dependencies=false --frozen-lockfile

##### BUILD

FROM node:22.21-alpine3.22 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN FORCE_COLOR=true pnpm build

##### RUNNER

FROM node:22.21-alpine3.22 AS runner
WORKDIR /app

ENV REDIS_HTTP_USERNAME=user
ENV REDIS_HTTP_PASSWORD=password
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY ./public/ ./public/
COPY ./drizzle/ ./drizzle/
COPY ./migrate.mjs .
COPY ./next.config.mjs .
COPY ./package.json .
COPY ./custom-incremental-cache-handler.mjs .

USER nextjs
EXPOSE 80
ENV PORT=80
ENV HOSTNAME=0.0.0.0

CMD ["sh", "-c", "node migrate.mjs && node server.js"]
