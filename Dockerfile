FROM oven/bun:1.1.33-slim

# Install Python and build essentials for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    python-is-python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install node-gyp globally
RUN bun add -g node-gyp

WORKDIR /app

COPY ./package.json bun.lockb ./

RUN bun install --frozen-lockfile --production --no-optional --verbose

COPY ./src ./src

ARG PORT
EXPOSE ${PORT:-3000}
 
CMD ["bun", "src/app.ts"]
