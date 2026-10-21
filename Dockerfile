FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps ./apps
COPY packages ./packages
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
