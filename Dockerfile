FROM node:22-bookworm-slim AS build

WORKDIR /app
COPY lib/package*.json ./
RUN npm ci
COPY lib/ .
RUN npm run build

FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80

RUN apt-get update \
    && apt-get install -y --no-install-recommends fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

COPY lib/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/build ./build
COPY --from=build /app/server.js ./server.js

EXPOSE 80
CMD ["node", "server.js"]
