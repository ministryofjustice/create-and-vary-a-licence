# Create and vary a licence

This is the user interface service for creating and varying licences for people
leaving prison.

## Dependencies
This service requires instances of these dependent services:
* `hmpps-auth` - authorisation and authentication
* `redis` - session store and token caching
* `prison-api` - prison data
* `community-api` - probation data  
* `create-and-vary-a-licence-api` - licence data  
* `gotenberg` - produce PDFs from HTML templated URLs

## Building

Ensure you have the appropriate tools installed:

`node - v14.16.x`

`npm - v6.x`

Then:

`$ npm install` - to pull and install dependent node modules.

`$ npm run build` - to compile SCSS files & populate the /dist folder.

`$ npm run lint` - to run the linter over the code

## Unit Tests (Jest)

`$ npm run test` - to run unit tests

## Integration tests (Cypress/Wiremock)

Pull images and start dependent services:

`$ docker-compise -f docker-compose-test.yaml pull`

`$ docker-compose -f docker-compose-test.yaml up`

In a different terminal:

`$ npm run start-feature` - to start the UI service with env settings to reference locally-mocked (wiremock) APIs:

In a third terminal:

`$ npm run build` - to compile resources

`$ npm run int-test` - to run Cypress tests in the background

OR

`$ npm run int-test-ui` - to run tests via the Cypress control panel

## Running locally

###1. Using docker-compose

`$ docker-compose pull` - To pull the latest images for the service and dependent containers.

`$ docker-compose up` - To start these containers locally (resource intensive!)

Point a browser to `localhost:3000`

###2. Running via npm

`$ npm run start:dev`  - to start the UI service 

Point a browser to `localhost:3000`

## Running locally against the DEV environment

Where your local machine does not cope well with multiple required containers it is possible to run a small number of 
containers locally whilst relying on the development services for others. You will need a VPN active.

###1. Edit the docker-compose.yaml to remove these sections:

* licences-db
* hmpps-auth
* prison-api
* community-api  
* create-and-vary-a-licence-api
* create-and-vary-a-licence

Which leaves these in place:

* redis
* gotenberg

2. Create a `.env` file in the root of the project with the following content :

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
GOTENBERG_API_URL=http://localhost:3001
```

3. `docker-compose up` to start the local services


4. Start a local `create-and-vary-a-licence` service with `$ npm run start:dev` which will use the `.env` file to set 
   up its environment to reference the DEV APIs.


5. Bear in mind that the login details, and all data you will see, will be from the `licence-db` and APIs in the DEV 
   environment. Only the redis functions and any use of the gotenberg container will be local operations.

### Run linter

`npm run lint`


## Deployment


## Helm

There are three services associated with this UI service:

* create-and-vary-a-licence  (generic-service)
* gotenberg (generic-service)
* generic-prometheus-alerts

## Dependency Checks

Some scheduled checks ensure that key dependencies are kept up to date.
They are implemented via a scheduled job in CircleCI. See the `check_outdated` job in `.circleci/config.yml`

## Generating types from OpenAPI

This service makes use of imported types generated from the openAPI definitions offered by each of the APIs.
Whenever the APIs change or new types are added, the scripts can be re-run to import these and make them available.
The types are committed into Git.
Scripts are provided to generate these types from the development instances:

`generate-community-api-types.sh` - Re-run when Community API types change

`generate-licence-api-types.sh` - Re-run when create and vary a licence API types change

`generate-prison-api-types.sh` - Re-run when prisoner API types change

`generate-prisoner-offender-search-types.sh`  Re-run when offender search API types change

