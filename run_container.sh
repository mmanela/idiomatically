#!/bin/bash

echo "Kill running containers"
docker kill $(docker ps -a "ancestor=idiomatically")

echo "Building container"
docker build -t idiomatically .

echo "Running container"
docker run -d -p 8000:8000 idiomatically

echo "Listing running containers"
docker ps