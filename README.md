# Create and vary a licence

This is the user interface service for creating and varying licences for people
leaving prison.

## Dependencies
The app requires instances of these services to be available:

* hmpps-auth - for authentication
* redis - session store and token caching
* prison-api - access to prisoner details
* create-and-vary-a-licence-api - access to licence data  
* gotenberg - container to produce PDFs from HTML template URLs

## Building

Ensure you have the approprite tools installed:

`node - v14.xx`

`npm - v6.x`

Then:

`$ npm install` - to pull and install dependent node modules.

`$ npm run build` - to compile SCSS files & populate the /dist folder.

## Unit Tests (Jest)

`$ npm run lint` - to run the linter over the code

`$ npm run test` - to run unit tests

## Integration tests (Cypress/Wiremock)

Start the redis and wiremock containers

`$ docker-compise -f docker-compose-test.yaml pull`

`$ docker-compise -f docker-compose-test.yaml up`

In a different terminal:

`$ npm run start-feature` - to start the service with settings that will be recognised by the wiremocked services.

OR 

`$ npm run start-feature:dev` - to start the with nodemon active for tests.

In a third terminal

`$ npm run build` - to build the application

`$ npm run int-test` - to run Cypress tests in the background

OR

`$ npm run int-test-ui` - to run tests via the Cypress control panel

## Running locally
###1. Using docker-compose
`$ docker-compose pull`
To pull the latest images for the service and dependent containers.

`$ docker-compose up` To start these containers

Point a browser to `localhost:3000`

###2. Running via npm

`$ npm run start:dev`  - to start the service 

Point a browser to `localhost:3000`


## Running locally against the DEV environment

Where your local machine does not cope well with multiple required containers it is possible to run a few containers locally whilst relying on the development services for others.

###1. Edit the docker-compose.yaml to remove:

* licences-db
* hmpps-auth
* prison-api
* create-and-vary-a-licence-api
* create-and-vary-a-licence

Which leaves these locally:

* redis
* gotenberg

2. Create a `.env` file with references to :

```
HMPPS_AUTH_URL=https://sign-in-dev.hmpps.service.justice.gov.uk/auth
TOKEN_VERIFICATION_API_URL=https://token-verification-api-dev.prison.service.justice.gov.uk
LICENCE_API_URL=https://create-and-vary-a-licence-api-dev.hmpps.service.justice.gov.uk
PRISON_API_URL=https://api-dev.prison.service.justice.gov.uk
OFFENDER_SEARCH_API_URL=https://prisoner-offender-search-dev.prison.service.justice.gov.uk
COMMUNITY_API_URL=https://community-api-secure.test.delius.probation.hmpps.dsd.io
API_CLIENT_ID=create-and-vary-a-licence-client
API_CLIENT_SECRET=<fill this in>
SYSTEM_CLIENT_ID=create-and-vary-a-licence-admin
SYSTEM_CLIENT_SECRET=<fill this in>
```

3. `docker-compose up` to start the local services


4. Start a local `create-and-vary-a-licence` service with `$ npm run start:dev` which will use the `.env` file to set 
   up its environment to reference the DEV APIs.


5. Bear in mind that the login details, and all data you will see, will be from the `licence-db` and APIs in the DEV 
   environment. Only the redis functions and any use of the gotenberg container will be local.

## Deployment


### Running the app for development

To start the containers locally : 

`docker-compose up`

Install dependencies using `npm install`, ensuring you are using >= `Node v14.x`

To build the assets and start the app with nodemon:

`npm run start:dev`

### Run linter

`npm run lint`

### Dependency Checks

Some scheduled checks ensure that key dependencies are kept up to date.
They are implemented via a scheduled job in CircleCI. See the `check_outdated` job in `.circleci/config.yml`

## Generating types from OpenAPI

This service makes use of imported types generated from the openAPI definitions offered by each of the APIs. 
Scripts are provided to generate these types from the development instances:

`generate-community-api-types.sh` - Re-run when Community API types change

`generate-licence-api-types.sh` - Re-run when create and vary a licence API types change

`generate-prison-api-types.sh` - Re-run when prisoner API types change

`generate-prisoner-offender-search-types.sh`  Re-run when offender search API types change

