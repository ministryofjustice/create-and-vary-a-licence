[![repo standards badge](https://img.shields.io/badge/dynamic/json?color=blue&style=flat&logo=github&label=MoJ%20Compliant&query=%24.result&url=https%3A%2F%2Foperations-engineering-reports.cloud-platform.service.justice.gov.uk%2Fapi%2Fv1%2Fcompliant_public_repositories%2Fcreate-and-vary-a-licence)](https://operations-engineering-reports.cloud-platform.service.justice.gov.uk/public-github-repositories.html#create-and-vary-a-licence 'Link to report')
[![CircleCI](https://circleci.com/gh/ministryofjustice/create-and-vary-a-licence/tree/main.svg?style=svg)](https://circleci.com/gh/ministryofjustice/create-and-vary-a-licence)
[![codecov](https://codecov.io/gh/ministryofjustice/create-and-vary-a-licence/branch/main/graph/badge.svg?token=S8DS3BV91P)](https://codecov.io/gh/ministryofjustice/create-and-vary-a-licence)

# Create and vary a licence

This is the user interface service for creating and varying licences for people
leaving prison.

## Dependencies

This service requires instances of these dependent services:

- `hmpps-auth` - authorisation and authentication
- `redis` - session store and token caching
- `prison-api` - prison data
- `create-and-vary-a-licence-and-delius` - probation data
- `create-and-vary-a-licence-api` - licence data
- `prisoner-offender-search` - prisoner search
- `probation-offender-search` - probation search
- `prison-register` - prison register and contant information
- `gotenberg` - produce PDFs from HTML templated URLs

It also requires a connection to 3 SQS queues to listen to prison events, probation events and HMPPS domain events.
In local development this uses localstack to simulate aws.

## Building

Use `nvm` to ensure that you are running the correct version of node.

Run `nvm install --latest-npm` within the repository folder to use the correct version of node, and the latest version of npm. This should match the `engines` config in `package.json` and the CircleCI build config.

Then:

`$ npm install` - to pull and install dependent node modules.

`$ npm run build` - to compile SCSS files & populate the /dist folder.

`$ npm run lint` - to run the linter over the code

`$ npm run lint -- --fix` - If you want to fix any linting issues automatically

## Unit Tests (Jest)

`$ npm run test` - to run unit tests

## Integration test (Jest) for Gotenberg

There is a single integration test to verify that the Gotenberg container can support the
conversion of HTML to PDF documents. To run this, follow these instructions:

`$ docker compose up -d`

This runs local redis and gotenberg containers.

`$ npm run integrationTest`

This runs the specific integration test `gotenbergIntegration.test.ts` causing a HTML document
to be sent to the local Gotenberg container, converted to PDF and returned. The PDF is parsed
to check that it contains some of the wording requested.

NOTE: This test is not currently run in CI.

## Integration tests (Cypress/Wiremock)

Pull images and start dependent services:

`$ docker compose -f docker-compose-test.yml pull`

`$ docker compose -f docker-compose-test.yml up -d`

In a different terminal:

`$ npm run build` - to compile resources

`$ npm run start-feature` - to start the UI service with env settings to reference locally-mocked (wiremock) APIs:

In a third terminal:

`$ npm run int-test` - to run Cypress tests in the background

OR

`$ npm run int-test-ui` - to run tests via the Cypress control panel

## Running locally

You will need to be on VPN.

###1. Locally required containers

These are:

- redis
- localstack
- gotenberg

2. Copy `.env.example` to `.env` or run `create-env-file.sh` in the root of the project and customise.
   For the client ID and secrets present in the file, you will need to retrieve these values from the kubernetes dev environment.

3. Run the following to start the required containers and start the local service, which will use the `.env` file to set up its environment to reference the DEV APIs.

`docker compose up -d && npm run start:dev`

4. Bear in mind that the login details, and all data you will see, will be from the `licence-db` and APIs in the DEV environment. Only the redis functions and any use of the gotenberg container will be local operations.

### Run linter

`npm run lint`

## Deployment

### Helm

There are four services associated with this UI service:

- create-and-vary-a-licence (generic-service)
- gotenberg (generic-service)
- generic-prometheus-alerts

## Generating types from OpenAPI

This service makes use of imported types generated from the openAPI definitions offered by each of the APIs.
Whenever the APIs change or new types are added, the scripts can be re-run to import these and make them available.
The types are committed into Git.

Scripts are provided to generate these types from the development instances:

`generate-delius-api-types.sh` - Re-run when Probation Integration API types change

`generate-licence-api-types.sh` - Re-run when create and vary a CVL licence API types change from dev
`generate-licence-api-types.sh --local` - Re-run when create and vary a CVL licence API types change from locally running API

`generate-prison-api-types.sh` - Re-run when prisoner API types change

`generate-prisoner-offender-search-types.sh` Re-run when prisoner offender search API types change

`generate-probation-offender-search-types.sh` Re-run when probation offender search API types change

`generate-prison-register-types.sh` Re-run when prison register API types change

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
needs to be passed into Gotenburg as an `extra-host`. See the `docker-compose.yaml` file for this.

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
