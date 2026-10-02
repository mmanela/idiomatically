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

COPY lib/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/build ./build
COPY --from=build /app/server.js ./server.js

EXPOSE 80
CMD ["node", "server.js"]
