[![codecov](https://codecov.io/gh/ministryofjustice/create-and-vary-a-licence/branch/main/graph/badge.svg?token=S8DS3BV91P)](https://codecov.io/gh/ministryofjustice/create-and-vary-a-licence)

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
* `prisoner-offender-search` - prisoner search
* `probation-offender-search` - probation search
* `prison-register` - prison register and contant information
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

## Integration test (Jest) for Gotenberg

There is a single integration test to verify that the Gotenberg container can support the
conversion of HTML to PDF documents. To run this, follow these instructions:

`$ docker-compose -f docker-compose-dev.yaml up -d`

This runs local redis and gotenberg containers.

`$ npm run integrationTest`

This runs the specific integration test `gotenbergIntegration.test.ts` causing a HTML document
to be sent to the local Gotenberg container, converted to PDF and returned. The PDF is parsed
to check that it contains some of the wording requested.

## Integration tests (Cypress/Wiremock)

Pull images and start dependent services:

`$ docker-compose -f docker-compose-test.yaml pull`

`$ docker-compose -f docker-compose-test.yaml up -d`

In a different terminal:

`$ npm run build` - to compile resources

`$ npm run start-feature` - to start the UI service with env settings to reference locally-mocked (wiremock) APIs:

In a third terminal:

`$ npm run int-test` - to run Cypress tests in the background

OR

`$ npm run int-test-ui` - to run tests via the Cypress control panel

## Running locally

###1. Using docker-compose

`$ docker-compose pull` - To pull the latest images for the service and dependent containers.

Then use the script:

`$ run-full.sh` -follow the onscreen instructions.

Point a browser to `localhost:3000` and login as a user with any of the roles - ROLE_LICENCE_CA, ROLE_LICENCE_CA, ROLE_LICENCE_DM.
e.g. AUTH_RO_USER2 or CVL_OMU_LOCAL (both with the standard local password)

Point a browser to `localhost:3000`

## Running locally against the DEV environment

Where your local machine does not cope well with multiple required containers it is possible to run a small number of 
containers locally whilst relying on the development services for others. You will need a VPN active.

###1. Locally required containers

These are:

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
PRISONER_SEARCH_API_URL=https://prisoner-offender-search-dev.prison.service.justice.gov.uk
PROBATION_SEARCH_API_URL=https://probation-offender-search-dev.hmpps.service.justice.gov.uk
API_CLIENT_ID=create-and-vary-a-licence-client
API_CLIENT_SECRET=fill this in
SYSTEM_CLIENT_ID=create-and-vary-a-licence-admin
SYSTEM_CLIENT_SECRET=fill this in
GOTENBERG_API_URL=http://localhost:3001
```

3. Start the two required containers.

   `$ docker-compose -f docker-compose-dev.yaml up -d` 


4. Start a local `create-and-vary-a-licence` service with `$ npm run start`, which will use the `.env` file to set 
   up its environment to reference the DEV APIs.
   

5. Bear in mind that the login details, and all data you will see, will be from the `licence-db` and APIs in the DEV 
   environment. Only the redis functions and any use of the gotenberg container will be local operations.

### Run linter

`npm run lint`


## Deployment


## Helm

There are four services associated with this UI service:

* create-and-vary-a-licence  (generic-service)
* gotenberg (generic-service)
* delius-wiremock (generic-service)
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

`generate-prisoner-offender-search-types.sh`  Re-run when prisoner offender search API types change

`generate-probation-offender-search-types.sh`  Re-run when probation offender search API types change

`generate-prison-register-types.sh`  Re-run when prison register API types change

There may be some manual editing needed, particularly to:

  - Replace double quotes with single-quotes
  - Remove all semi-colons
  - Validate the api-docs endpoint for swagger (in case it changes)
  - Eslint ignore any lines which complain about not being camel-case with `eslint-disable camelcase`
  - Eslint ignore empty interfaces with `eslint-disable-next-line @typescript-eslint/no-empty-interface`
or remove the unused and empty interface.

## Gotenberg Container

The Gotenberg container is used only to convert templated HTML into PDF files for viewing and saving.

Whilst running locally, the Gotenberg container needs to know how to contact the `create-and-vary-a-licence` service
using a hostname. It does this to pull in resources like stylesheets and images whilst rendering the HTML.

For any docker container to reference the docker host (where the UI service is running), the hostname 
`host.docker-internal` is used. For Mac and Windows users, this just works. For Linux users, this host
needs to be passed into Gotenburg as an `extra-host`. See the `docker-compose-test.yaml` file for this.

e.g. 
```angular2html
gotenberg:
    image: thecodingmachine/gotenberg:6.4.3
    networks:
      - hmpps
    container_name: gotenberg
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

When Gotenberg is running in the Cloud Platform environments it can reference the UI service using its
Kubernetes service name like this:

```angular2html
LICENCES_URL: "http://create-and-vary-a-licence:80"
```

It uses HTTP for these requests which stay local within the Cloud Platform namespace.
