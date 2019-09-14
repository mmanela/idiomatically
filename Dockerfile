FROM node:lts-alpine

LABEL NAME=idiom

# Setup server
WORKDIR /usr/src/app/server
COPY server/package*.json ./
COPY server/yarn.lock ./
RUN yarn install --production

# Setup client
WORKDIR /usr/src/app/client
COPY client/package*.json ./
COPY client/yarn.lock ./
RUN yarn install --production=false

# Copy contents
WORKDIR /usr/src/app
COPY . .

# Build Client
WORKDIR /usr/src/app/client
RUN yarn build

# Start Server
WORKDIR /usr/src/app/server
EXPOSE 8000
CMD ["yarn","prod"]