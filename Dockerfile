FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY apps ./apps
COPY packages ./packages

ENV NODE_ENV=production
EXPOSE 8080

USER node
CMD ["npm","start"]
