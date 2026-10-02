FROM node:22-bookworm-slim

LABEL NAME=idiom

ENV REACT_APP_SERVER https://idiomatically.net

# Setup app
COPY lib/package*.json ./
RUN npm ci

# Copy contents
COPY lib/ .

# Build Client
RUN npm run client:build

# Start Server
ENV PORT 80
EXPOSE 80
CMD ["npm", "run", "server:prod"]