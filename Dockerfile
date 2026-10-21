FROM node:22-alpine

WORKDIR /app

# Preserve non-root runtime access even when the checkout uses owner-only modes.
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node apps ./apps
COPY --chown=node:node packages ./packages
# Runtime/MCP imports and start:release require these existing contract helpers.
COPY --chown=node:node scripts/release ./scripts/release
# Optional organization CA for verified installs behind an HTTPS proxy. The CA
# mount is ephemeral and is never copied into the runtime image.
RUN --mount=type=secret,id=registry_ca \
    if [ -s /run/secrets/registry_ca ]; then \
      NODE_EXTRA_CA_CERTS=/run/secrets/registry_ca npm ci --omit=dev --fetch-retries=1 --fetch-timeout=20000; \
    else npm ci --omit=dev --fetch-retries=1 --fetch-timeout=20000; fi

ENV NODE_ENV=production
EXPOSE 8080

USER node
CMD ["npm","start"]
