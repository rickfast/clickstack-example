FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lockb* ./
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN bun install --frozen-lockfile || bun install

COPY . .

EXPOSE 3003

CMD ["bun", "run", "start"]