# Copilot Instructions: Create and Vary a Licence

## Repository Overview

**Purpose**: User interface service for creating and varying licences for people leaving prison. This is a UK Ministry of Justice HMPPS (Her Majesty's Prison & Probation Service) application.

**Tech Stack**: Node.js 24, TypeScript, Express.js, Nunjucks templates, Jest, Cypress, Docker, CircleCI
**Size**: ~1000+ TypeScript files across server, integration tests, and Cypress tests
**Architecture**: MVC pattern with RESTful API clients connecting to multiple backend services

## Critical Build Information

### Prerequisites
- **Node.js**: Version 24.x (specified in package.json engines)
- **npm**: Version 11.x
- Use `nvm install --latest-npm` to ensure correct versions

### Build Commands (ALWAYS RUN IN THIS ORDER)

1. **Install dependencies**: `npm run setup` (NOT `npm install`)
   - This runs `npm ci && hmpps-npm-script-run-allowlist`
   - CircleCI uses this command
   - NEVER use `npm install` in CI or production builds

2. **Build the application**: `npm run build`
   - Removes `dist/` folder
   - Compiles SASS to CSS via `./bin/build-css.sh`
   - Compiles TypeScript to JavaScript
   - Copies Nunjucks views to `dist/server/views/`
   - **Always run this before testing or starting the app**

3. **Type checking**: `npm run typecheck` (runs `tsc` without emitting files)

4. **Linting**: `npm run lint`
   - Uses ESLint with `@ministryofjustice/eslint-config-hmpps`
   - Caches results, max 0 warnings allowed
   - **Lint check runs AFTER build in CI** (integration tests depend on compiled TypeScript)

### Test Commands

**Unit Tests (Jest)**:
- `npm run test` - Runs all Jest unit tests with coverage (maxWorkers=2)
- `npm run test:ci` - CI version, only runs `/server/.*` tests
- Tests output to `test_results/jest/` and `test_results/unit-test-reports.html`
- Coverage reports to `coverage/coverage-final.json`

**Integration Tests (Cypress)**:

Prerequisites - start Docker services FIRST:
```bash
docker compose -f docker-compose-test.yml pull
docker compose -f docker-compose-test.yml up -d
```

This starts: redis, wiremock (port 9091), gotenberg (port 3002), localstack (port 4566)

Then:
```bash
npm run build  # REQUIRED before integration tests
npm run start-feature  # Starts app with feature.env settings, uses wiremock
npm run int-test  # Runs Cypress headless
# OR
npm run int-test-ui  # Opens Cypress UI
```

**Gotenberg Integration Test**:
```bash
docker compose up -d  # Starts local redis & gotenberg only
npm run integrationTest  # Runs gotenbergIntegration.test.ts
```
Note: This test is NOT run in CI currently.

### Running Locally

**Local Development** (requires VPN):
1. Start required containers: `docker compose up -d` (redis, gotenberg, localstack)
2. Create `.env` file: Run `./create-env-file.sh` (fetches secrets from k8s dev namespace)
3. Start dev server: `npm run start:dev`
   - Runs concurrent watch processes for views, TypeScript, Node, and SASS
   - Uses `.env` file, connects to DEV environment APIs

**Feature Testing** (for integration tests):
- Uses `feature.env` file with wiremock endpoints
- Start with: `npm run start-feature` or `npm run start-feature:dev`

## Project Structure

### Root Files
- `server.ts` - Application entry point, initializes app insights, starts Express server and SQS listeners
- `logger.ts` - Bunyan logger configuration
- `package.json` - Dependencies and npm scripts
- `tsconfig.json` - TypeScript config extending @tsconfig/node24
- `eslint.config.mjs` - ESLint configuration
- `jest.setup.ts` - Jest setup (imports reflect-metadata)
- `cypress.config.ts` - Cypress E2E test configuration
- `docker-compose.yml` - Local dev containers (redis, gotenberg, localstack)
- `docker-compose-test.yml` - Integration test containers (adds wiremock)
- `Dockerfile` - Multi-stage build for deployment

### Shell Scripts
- `bin/build-css.sh` - Compiles SASS with load paths for govuk-frontend, MOJ frontend, and DPR frontend
- `create-env-file.sh` - Fetches secrets from kubernetes dev namespace for local development
- `generate-*-api-types.sh` - Regenerate TypeScript types from OpenAPI specs (5 scripts for different APIs)
- `localstack/01-setup-queues.sh` - Creates SQS queues for prison, probation, and domain events

### Server Directory (`server/`)

**Core Files**:
- `app.ts` - Express app factory, sets up middleware, routes, error handling
- `index.ts` - Exports app factory and SQS listeners
- `config.ts` - Environment variable configuration with production requirement checks
- `errorHandler.ts` - Express error handling middleware
- `applicationInfo.ts` - Build and git info for health endpoints

**Key Subdirectories**:
- `@types/` - Generated TypeScript definitions from external API OpenAPI specs
- `authentication/` - OAuth2 passport strategy
- `config/` - Feature flags and environment-specific configuration
- `data/` - API clients (licenceApiClient, prisonApiClient, deliusClient, etc.), Redis client
- `enumeration/` - Enums for licence types, status codes, roles
- `licences/` - Core licence domain logic
- `listeners/` - SQS event listeners for prison/probation/domain events
- `middleware/` - Express middleware (auth, session, security, CSRF, health checks)
- `routes/` - Route handlers organized by feature (creatingLicences, varyingLicences, approvingLicences, etc.)
- `services/` - Business logic services (licenceService, prisonerService, conditionService, etc.)
- `utils/` - Utilities (PDF renderer via Gotenberg, Nunjucks setup, Azure App Insights)
- `validators/` - Request validation using class-validator
- `views/` - Nunjucks templates (layout.njk, pages/, partials/, customComponents/)

### Test Directories
- `integration_tests/` - Cypress integration tests and wiremock mocks
  - `integration/` - Cypress test specs
  - `mockApis/` - Wiremock stub configurations
  - `pages/` - Cypress page objects
- `test_results/` - Test output (Jest HTML reports, Cypress screenshots/videos)

### Deployment
- `helm_deploy/` - Kubernetes helm charts for dev, preprod, prod, test1, test2 environments

## CI/CD Pipeline (CircleCI)

**Configuration**: `.circleci/config.yml`

**Workflow**: build-test-and-deploy
1. `build` job:
   - Uses node:24.11-browsers image
   - Updates npm to v11
   - Runs `npm run setup` (NOT npm install)
   - Runs `npm run build`
   - Runs `npm run lint` (after build)
   - Persists workspace (node_modules, assets/stylesheets, build, dist)

2. `unit_test` job:
   - Runs `npm run test:ci`
   - Uploads coverage to codecov
   - Stores test results and reports

3. `integration_test` job:
   - Uses integration-tests executor (node + redis + localstack)
   - Installs AWS CLI
   - Waits 10 seconds for localstack to start
   - Creates SQS queues via AWS CLI
   - Downloads wiremock.jar, runs on port 9091
   - Runs `npm run start-feature` in background
   - Waits 5 seconds for app to start
   - Runs `npm run int-test`
   - Stores videos and screenshots

4. Deployment jobs: deploy_dev → deploy_preprod (approval) → deploy_prod (approval)

**Important**: CircleCI does NOT run the Gotenberg integration test.

## Key Dependencies & External Services

**Backend Services** (configured in `server/config.ts`):
- hmpps-auth - Authentication/authorization
- create-and-vary-a-licence-api - Licence data API
- prison-api - Prison data
- prisoner-offender-search - Prisoner search
- probation-offender-search - Probation search (via Delius)
- prison-register - Prison information
- gotenberg - HTML to PDF conversion

**Message Queues** (SQS via localstack in dev):
- create_and_vary_a_licence_prison_events_queue
- create_and_vary_a_licence_probation_events_queue
- create_and_vary_a_licence_domain_events_queue

**Frontend Libraries**:
- govuk-frontend 5.13.0
- @ministryofjustice/frontend 8.0.0
- @ministryofjustice/hmpps-digital-prison-reporting-frontend 4.21.0

## Common Gotchas & Workarounds

1. **Always run `npm run setup` not `npm install`**: The setup script runs additional security checks.

2. **Build before integration tests**: Integration test code depends on compiled TypeScript from dist/.

3. **Linting runs after build**: This is intentional - integration test code references compiled types.

4. **Localstack timing**: Wait 10 seconds after starting localstack before creating queues (as per CircleCI config).

5. **Wiremock port**: Integration tests use port 9091 for wiremock (configured in docker-compose-test.yml).

6. **Gotenberg host resolution**:
   - Mac/Windows: Uses `host.docker.internal` automatically
   - Linux: Requires `extra_hosts` in docker-compose.yml (already configured)

7. **Generated API types**: After regenerating types from OpenAPI specs, manually:
   - Replace double quotes with single quotes
   - Remove semicolons
   - Add `eslint-disable camelcase` for non-camelCase properties
   - Remove or ignore empty interfaces

8. **Redis required**: Redis is required even for local dev (session store and token caching).

9. **VPN required for local dev**: Connecting to DEV environment APIs requires VPN access.

10. **Environment files**:
    - `.env` for local dev (created by `create-env-file.sh`)
    - `feature.env` for integration tests (already in repo)

## Validation Checklist

Before submitting code changes:
1. ✅ Run `npm run typecheck` - Must pass with no errors
2. ✅ Run `npm run lint` - Must pass with 0 warnings
3. ✅ Run `npm run build` - Must complete successfully
4. ✅ Run `npm run test` - All unit tests must pass
5. ✅ Run integration tests if modifying routes/views:
   - Start `docker compose -f docker-compose-test.yml up -d`
   - Run `npm run build && npm run start-feature` in one terminal
   - Run `npm run int-test` in another terminal
6. ✅ Check that no new TODO/FIXME comments are added without explanation

## Trust These Instructions

These instructions are comprehensive and validated. Only search for additional information if:
- You encounter an error not documented here
- You need to understand implementation details of a specific module
- The instructions appear outdated (check file modification dates)

For most tasks, these instructions contain everything you need to successfully build, test, and validate changes to this repository.
