#!/bin/bash

# This script is used to run the Create and Vary a licence UI locally, to sets up the containers and installs the
# necessary dependencies required for the UI.
#
# Following this, the script starts the UI locally
#

# Stop the front end containers
echo "Bringing down current containers ..."
docker compose down --remove-orphans

#Prune existing containers
#Comment in if you wish to perform a fresh install as all containers are removed and deleted
#You will be prompted to continue with the deletion in the terminal
#docker system prune --all

#Install npm and relevant dependencies for the service
echo "Installing npm ..."
npm install

#Pull the latest versions of the containers required for the service and bring them up, waiting for them to be in a
#healthy state before starting the service
echo "Pulling front end containers ..."
docker compose -f docker-compose.yml pull
docker compose -f docker-compose.yml up -d

echo "Waiting for front end containers to be ready ..."
until [ "$(docker inspect -f {{.State.Health.Status}} gotenberg)" == "healthy" ]; do
    sleep 0.1;
done;
until [ "$(docker inspect -f {{.State.Health.Status}} redis)" == "healthy" ]; do
    sleep 0.1;
done;
until [ "$(docker inspect -f {{.State.Health.Status}} localstack)" == "healthy" ]; do
    sleep 0.1;
done;

echo "Front end containers are now ready ..."

# Start the service using the start:dev script
echo "Starting the UI locally"
npm run start:dev

# End
