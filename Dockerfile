FROM node:lts-alpine

LABEL NAME=idiom

# Setup app
WORKDIR /usr/src/app
COPY lib/package*.json ./
COPY lib/yarn.lock ./
RUN yarn install --production=false

# Copy contents
COPY lib/ .

# Build Client
RUN yarn client:build

# Start Server
WORKDIR /usr/src/app/server
EXPOSE 80
CMD ["yarn","server:prod"]