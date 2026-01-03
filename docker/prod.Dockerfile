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

FROM deps AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

ARG SESSION_SECRET
ARG GITHUB_SECRET
ARG GITHUB_CLIENT_ID
ARG GITHUB_REDIRECT_URI
ARG GITHUB_PERSONAL_ACCESS_TOKEN
ARG DATABASE_URL
ARG NEXT_PUBLIC_VERCEL_URL

ENV SESSION_SECRET=${SESSION_SECRET}
ENV GITHUB_SECRET=${GITHUB_SECRET}
ENV GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
ENV GITHUB_REDIRECT_URI=${GITHUB_REDIRECT_URI}
ENV GITHUB_PERSONAL_ACCESS_TOKEN=${GITHUB_PERSONAL_ACCESS_TOKEN}
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_PUBLIC_VERCEL_URL=${NEXT_PUBLIC_VERCEL_URL}

RUN FORCE_COLOR=true pnpm build

##### RUNNER

FROM deps AS runner
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
ENV FORCE_COLOR=true

CMD ["sh", "-c", "node migrate.mjs && node server.js"]
