FROM oven/bun:alpine AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
WORKDIR /temp/dev
RUN bun install --frozen-lockfile && mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
WORKDIR /temp/prod
RUN bun install --frozen-lockfile --production

FROM base as prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
RUN bun test && bun run build

FROM base AS release
WORKDIR /app
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/index.ts .
COPY --from=prerelease /usr/src/app/package.json .

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN "apk add --no-cache --quiet wget=1.25.0-r2 \
  && wget https://aka.ms/downloadazcopy-v10-linux -O /tmp/azcopy.tgz \
  && export BIN_LOCATION=$(tar -tzf /tmp/azcopy.tgz | grep "/azcopy") \
  && tar -xzf /tmp/azcopy.tgz $BIN_LOCATION --strip-components=1 -C /usr/bin"

USER bun

ENTRYPOINT [ "bun", "run", "index.ts" ]