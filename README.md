# Create and vary a licence

This is the user interface service for creating and varying licences for people
leaving prison.

## Dependencies
The app requires instances of these services to be available:
* hmpps-auth - for authentication
* redis - session store and token caching
* create-and-vary-a-licence-api - for access to licence data

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

## Deployment


### Running the app for development

To start the main services excluding the example typescript template app: 

`docker-compose up`

Install dependencies using `npm install`, ensuring you are using >= `Node v14.x`

And then, to build the assets and start the app with nodemon:

`npm run start:dev`

### Run linter

`npm run lint`

### Dependency Checks

Some scheduled checks ensure that key dependencies are kept up to date.
They are implemented via a scheduled job in CircleCI. 
See the `check_outdated` job in `.circleci/config.yml`
