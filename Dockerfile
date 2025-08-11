FROM oven/bun:alpine AS base
WORKDIR /app

FROM peterdavehello/azcopy:10.11.0 AS azcopy

FROM base AS release
COPY src/ index.ts package.json bun.lock ./
COPY --from=azcopy /usr/local/bin/azcopy /usr/bin/azcopy
RUN bun install --frozen-lockfile --production

RUN apk add --no-cache certbot

VOLUME ["/etc/azure-storage"]
VOLUME ["/etc/letsencrypt"]

ENTRYPOINT [ "bun", "run", "index.ts" ]