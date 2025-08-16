FROM oven/bun:alpine AS base
WORKDIR /app

FROM peterdavehello/azcopy:10.11.0 AS azcopy

FROM base AS prerelease
RUN apk add --no-cache certbot bash
SHELL ["/bin/bash", "-c"]
RUN chsh -s /bin/bash && shopt -s globstar
COPY --from=azcopy /usr/local/bin/azcopy /usr/bin/azcopy

FROM prerelease AS release
COPY index.ts package.json bun.lock ./
COPY src/ ./src/
RUN bun install --frozen-lockfile --production

VOLUME ["/etc/azure-storage"]
VOLUME ["/etc/letsencrypt"]

ENTRYPOINT [ "bun", "run", "index.ts" ]
