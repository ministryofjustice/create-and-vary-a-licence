#
# Starts the full-featured create-and-vary-a-licence service with dependecies.
# Provides instructions for setting up dependent services.
#
# Assumes that create-and-vary-a-licence and create-and-vary-a-licence-api will 
# be run locally outside of docker.
#

# Create docker containers
docker-compose up --no-start 

echo "Starting required docker containers"
docker start redis hmpps-auth licences-db prison-api gotenberg

echo "Run the create-and-vary-a-licence-api in another terminal"
echo " $ ./run-local.sh  - to run the api and migrate/seed the database"

echo "Run the UI service locally"
echo " $ npm run start:dev"

echo " Point your browser at localhost:3000"

# End
