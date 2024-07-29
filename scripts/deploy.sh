## On your local machine, use scp to transfer the file to your Droplet:
scp docker-compose.deploy.yml root@128.199.102.251:/root/
scp local.yml root@128.199.102.251:/root/

## Build the images using docker-compose:
docker-compose -f docker-compose.build.yml build

## login docker hub
## docker login 

## push image build above
## push dockerhub_username/name_container:tag
docker push santa124/postgres:12.2-alpine
docker push santa124/nakama:3.22.0

## using docker compose pull docker image from docker hub
docker-compose -f docker-compose.deploy.yml pull

## then deploy with docker compose up -d
docker-compose -f docker-compose.deploy.yml up -d