#!/bin/bash

if [[ $1 == "prod" ]]; then
    DockerFile="Dockerfile"
    Port=80
else
    DockerFile="Dockerfile.staging"
    Port=8000
fi


echo "Kill running containers"
docker kill $(docker ps -q --filter label=idiomatically)

echo "Building container"
docker build -t idiomatically -f $DockerFile .

echo "Running container"
docker run -l idiomatically -d -p $Port:$Port  idiomatically

echo "Listing running containers"
docker ps