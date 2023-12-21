##### DEPENDENCIES

FROM --platform=linux/amd64 node:20-alpine3.19 AS deps
RUN apk add --no-cache libc6-compat 
RUN apk update && apk upgrade openssl
WORKDIR /app

# Install dependencies based on the preferred package manager

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml\* ./
COPY ./patches ./patches

RUN \
 if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
 elif [ -f package-lock.json ]; then npm ci; \
 elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm install --shamefully-hoist --strict-peer-dependencies=false --frozen-lockfile; \
 else echo "Lockfile not found." && exit 1; \
 fi

##### BUILDER

FROM --platform=linux/amd64 node:20-alpine3.19 AS builder

ARG SESSION_SECRET
ARG DATABASE_URL
ARG GITHUB_CLIENT_ID
ARG GITHUB_SECRET
ARG GITHUB_PERSONAL_ACCESS_TOKEN
ARG KV_PREFIX
ARG NEXT_PUBLIC_VERCEL_URL="localhost:3000"
ARG REDIS_HTTP_URL="http://webdis:7379"
ARG REDIS_HTTP_USERNAME="user"
ARG REDIS_HTTP_PASSWORD="password"
ARG GITHUB_REDIRECT_URI="http://localhost:3000/api/auth/callback"

ENV NEXT_PUBLIC_VERCEL_URL=$NEXT_PUBLIC_VERCEL_URL
ENV SESSION_SECRET=$SESSION_SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
ENV GITHUB_REDIRECT_URI=$GITHUB_REDIRECT_URI
ENV GITHUB_SECRET=$GITHUB_SECRET
ENV GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_PERSONAL_ACCESS_TOKEN
ENV REDIS_HTTP_URL=$REDIS_HTTP_URL
ENV REDIS_HTTP_USERNAME=$REDIS_HTTP_USERNAME
ENV REDIS_HTTP_PASSWORD=$REDIS_HTTP_PASSWORD
ENV KV_PREFIX=$KV_PREFIX

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN \
 if [ -f yarn.lock ]; then yarn build; \
 elif [ -f package-lock.json ]; then npm run build; \
 elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm run db:migrate-docker && pnpm run build; \
 else echo "Lockfile not found." && exit 1; \
 fi

##### RUNNER

FROM --platform=linux/amd64 node:20-alpine3.19 AS runner
WORKDIR /app

ARG SESSION_SECRET
ARG DATABASE_URL
ARG GITHUB_CLIENT_ID
ARG GITHUB_SECRET
ARG GITHUB_PERSONAL_ACCESS_TOKEN
ARG KV_PREFIX
ARG NEXT_PUBLIC_VERCEL_URL="localhost:3000"
ARG REDIS_HTTP_URL="http://webdis:7379"
ARG REDIS_HTTP_USERNAME="user"
ARG REDIS_HTTP_PASSWORD="password"
ARG GITHUB_REDIRECT_URI="http://localhost:3000/api/auth/callback"

ENV NEXT_PUBLIC_VERCEL_URL=$NEXT_PUBLIC_VERCEL_URL
ENV SESSION_SECRET=$SESSION_SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
ENV GITHUB_REDIRECT_URI=$GITHUB_REDIRECT_URI
ENV GITHUB_SECRET=$GITHUB_SECRET
ENV GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_PERSONAL_ACCESS_TOKEN
ENV REDIS_HTTP_URL=$REDIS_HTTP_URL
ENV REDIS_HTTP_USERNAME=$REDIS_HTTP_USERNAME
ENV REDIS_HTTP_PASSWORD=$REDIS_HTTP_PASSWORD
ENV KV_PREFIX=$KV_PREFIX

ENV NODE_ENV production

ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME 0.0.0.0

CMD [ "node", "server.js"]
