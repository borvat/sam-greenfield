FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-15 postgresql-client-15 ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY apps ./apps
COPY packages ./packages
COPY scripts ./scripts
COPY tsconfig.json ./
COPY tests ./tests
COPY vendor ./vendor
RUN npm ci && npm run typecheck
COPY deploy/render-test ./deploy/render-test
ARG RENDER_GIT_COMMIT
RUN node deploy/render-test/build-verify.cjs
ENV NODE_ENV=development SAM_DEVELOPMENT_SAFE_MODE=1
CMD ["node", "deploy/render-test/start.cjs"]
