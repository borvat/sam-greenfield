FROM node:24-bookworm-slim
WORKDIR /app
COPY package*.json ./
COPY apps ./apps
COPY packages ./packages
COPY scripts ./scripts
COPY tests ./tests
COPY tsconfig.json ./
COPY vendor ./vendor
COPY deploy/reliability-test ./deploy/reliability-test
RUN npm ci --ignore-scripts --no-audit --no-fund && npm run typecheck \
 && ./node_modules/.bin/tsc --noEmit --target ES2023 --module ESNext --moduleResolution Bundler --lib ES2023,DOM,DOM.Iterable --types node --esModuleInterop --strict --skipLibCheck deploy/reliability-test/entry.ts deploy/reliability-test/persistentBinding.ts deploy/reliability-test/memorySentinel.ts deploy/reliability-test/startup.test.ts deploy/reliability-test/ownerAcceptance.ts deploy/reliability-test/ownerAcceptanceOperator.ts deploy/reliability-test/ownerAcceptance.test.ts \
 && DATABASE_URL=postgres://fixture:fixture@127.0.0.1:1/fixture node --import tsx --test deploy/reliability-test/startup.test.ts deploy/reliability-test/ownerAcceptance.test.ts
ENV NODE_ENV=development SAM_DEVELOPMENT_SAFE_MODE=1
CMD ["node", "--import", "tsx", "deploy/reliability-test/entry.ts"]
