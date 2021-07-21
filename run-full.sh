#
# Starts the full-featured create-and-vary-a-licence service with dependecies.
# Provides instructions for setting up dependent services.
#
# Assumes that create-and-vary-a-licence and create-and-vary-a-licence-api will 
# be run locally outside of docker.
#

# Create docker containers
docker-compose up --no-start --scale=create-and-vary-a-licence=0

echo "Starting required docker containers"
docker start redis hmpps-auth licences-db

# These will be needed if we use localstack and prisoner-offender-search - quite likely

# echo "Now run localstack in another terminal:"
# echo " $ docker logs --follow localstack"
# echo " Wait for the logs to indicate setup complete"

# echo "Now run prisoner-offender search - and setup the indexed data"
# echo " $ docker start prisoner-offender-search"
# echo " $ ./setup-prisoner-search.sh"
# echo "This will index prisoners into prisoner-offender-search service - wait until it exits"

echo "Run the create-and-vary-a-licence-api in another terminal"
echo " $ ./run-local.sh  - to run the api and migrate/seed the database"

echo "Run the UI service locally"
echo " $ npm run start:dev"

echo " Point your browser at localhost:3000"

# End
