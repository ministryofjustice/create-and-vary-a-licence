const production = process.env.NODE_ENV === 'production'

function get<T>(name: string, fallback: T, options = { requireInProduction: false }): T | string {
  if (process.env[name]) {
    return process.env[name]
  }
  if (fallback !== undefined && !(production && options.requireInProduction)) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true }

export class AgentConfig {
  timeout: number

  constructor(timeout = 8000) {
    this.timeout = timeout
  }
}

export interface ApiConfig {
  url: string
  timeout: {
    response: number
    deadline: number
  }
  agent: AgentConfig
}

export default {
  buildNumber: get('BUILD_NUMBER', '1_0_0', requiredInProduction),
  productId: get('PRODUCT_ID', 'UNASSIGNED', requiredInProduction),
  gitRef: get('GIT_REF', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  dpsUrl: get('DPS_URL', 'http://localhost:3000', requiredInProduction),
  serviceNowUrl: get('SERVICE_NOW_URL', 'http://localhost:3000', requiredInProduction),
  epf2Url: get('EPF2_URL', 'http://localhost:3000', requiredInProduction),
  serviceName: process.env.SERVICE_NAME || 'create-and-vary-a-licence',
  phaseName: process.env.SYSTEM_PHASE || 'BETA',
  branchName: get('GIT_BRANCH', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  production,
  https: production,
  staticResourceCacheDuration: '1h',
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_AUTH_TOKEN,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false'),
  },
  session: {
    secret: get('SESSION_SECRET', 'app-insecure-default-session', requiredInProduction),
    expiryMinutes: Number(get('WEB_SESSION_TIMEOUT_IN_MINUTES', 120)),
  },
  sqs: {
    prisonEvents: {
      queueUrl: get(
        'SQS_PRISON_EVENTS_QUEUE_URL',
        'http://sqs.eu-west-2.localhost.localstack.cloud:4566/000000000000/create_and_vary_a_licence_prison_events_queue',
        requiredInProduction,
      ),
    },
    probationEvents: {
      queueUrl: get(
        'SQS_PROBATION_EVENTS_QUEUE_URL',
        'http://sqs.eu-west-2.localhost.localstack.cloud:4566/000000000000/create_and_vary_a_licence_probation_events_queue',
        requiredInProduction,
      ),
    },
    domainEvents: {
      queueUrl: get(
        'SQS_DOMAIN_EVENTS_QUEUE_URL',
        'http://sqs.eu-west-2.localhost.localstack.cloud:4566/000000000000/create_and_vary_a_licence_domain_events_queue',
        requiredInProduction,
      ),
    },
    pollingWaitTimeMs: Number(get('SQS_POLLING_WAIT_TIME_MS', 10000)),
    endpoint: production ? null : 'http://127.0.0.1:4566',
  },
  apis: {
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      healthPath: '/health/ping',
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000))),
      apiClientId: get('API_CLIENT_ID', 'create-and-vary-a-licence-client', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      systemClientId: get('SYSTEM_CLIENT_ID', 'create-and-vary-a-licence-admin', requiredInProduction),
      systemClientSecret: get('SYSTEM_CLIENT_SECRET', 'client_secret', requiredInProduction),
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000))),
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
    licenceApi: {
      url: get('LICENCE_API_URL', 'http://localhost:8089', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('LICENCE_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('LICENCE_API_TIMEOUT_DEADLINE', 30000)),
      },
      agent: new AgentConfig(Number(get('LICENCE_API_TIMEOUT_RESPONSE', 30000))),
    },
    prisonApi: {
      url: get('PRISON_API_URL', 'http://localhost:8080', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('PRISON_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('PRISON_API_TIMEOUT_DEADLINE', 30000)),
      },
      agent: new AgentConfig(Number(get('PRISON_API_TIMEOUT_RESPONSE', 30000))),
    },
    prisonerSearchApi: {
      url: get('PRISONER_SEARCH_API_URL', 'http://localhost:8090', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('PRISONER_SEARCH_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('PRISONER_SEARCH_API_TIMEOUT_DEADLINE', 30000)),
      },
      agent: new AgentConfig(Number(get('PRISONER_SEARCH_API_TIMEOUT_RESPONSE', 30000))),
    },
    prisonRegisterApi: {
      url: get('PRISON_REGISTER_API_URL', 'http://localhost:8092', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('PRISON_REGISTER_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('PRISON_REGISTER_API_TIMEOUT_DEADLINE', 30000)),
      },
      agent: new AgentConfig(Number(get('PRISON_REGISTER_API_TIMEOUT_RESPONSE', 30000))),
    },
    delius: {
      url: get('DELIUS_API_URL', 'http://localhost:8088', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('DELIUS_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('DELIUS_API_TIMEOUT_DEADLINE', 30000)),
      },
      agent: new AgentConfig(Number(get('DELIUS_API_TIMEOUT_RESPONSE', 30000))),
    },
    gotenberg: {
      url: get('GOTENBERG_API_URL', 'http://localhost:3002', requiredInProduction),
      healthPath: '/health',
      pdfOptions: {
        marginTop: '0.8',
        marginBottom: '0.7',
        marginLeft: '0.55',
        marginRight: '0.35',
      },
      agent: new AgentConfig(Number(get('GOTENBERG_API_TIMEOUT_RESPONSE', 30000))),
      watermark: get('LICENCE_WATERMARK', 'false') === 'true',

      /*
       This is specific to the machine type you use locally:
       - For Mac or Docker-for-Windows users,  http://host.docker.internal:3000 finds the docker host
       - For Linux users, this will also work, and is defined as an extra_host in the gotenberg
         container specification.
       - In Cloud Platform environments, this value is overridden with a URL with the container name
         You can check if this works using curl from within the Gotenberg container:
         $ docker exec -it <gotenberg-container-id> /bin/bash
         $ curl http://host.docker.internal:3000  (should show redirect /login)
       */
      licencesUrl: get('LICENCES_URL', 'http://host.docker.internal:3000', requiredInProduction),
    },
    frontendComponents: {
      url: get('COMPONENT_API_URL', 'http://localhost:3000', requiredInProduction),
      healthPath: '/ping',
      timeout: {
        response: Number(get('COMPONENT_API_TIMEOUT_SECONDS', 2000)),
        deadline: Number(get('COMPONENT_API_TIMEOUT_SECONDS', 2000)),
      },
      agent: new AgentConfig(Number(get('COMPONENT_API_TIMEOUT_SECONDS', 2000))),
      enabled: get('COMMON_COMPONENTS_ENABLED', 'true') === 'true',
    },
    manageUsersApi: {
      url: get('MANAGE_USERS_API_URL', 'http://localhost:8080', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('MANAGE_USERS_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('MANAGE_USERS_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('MANAGE_USERS_API_TIMEOUT_DEADLINE', 10000))),
    },
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  qrCodesEnabled: get('QR_CODES_ENABLED', 'false') === 'true',
  analytics: {
    tagManagerContainerId: get('TAG_MANAGER_CONTAINER_ID', ''),
  },
  showWhatsNewBanner: get('SHOW_WHATS_NEW_BANNER', 'false', requiredInProduction) === 'true',
  fridayReleasePolicy: get(
    'FRIDAY_RELEASE_POLICY',
    'https://www.gov.uk/government/publications/discretionary-fridaypre-bank-holiday-release-scheme-policy-framework',
    requiredInProduction,
  ),
  monitoringSupplierTelephone: get('MONITORING_SUPPLIER_TELEPHONE', '0800 137 291', requiredInProduction),
  hdcIntegrationMvp2Enabled: get('HDC_INTEGRATION_MVP2_ENABLED', 'false', requiredInProduction) === 'true',
  hdcLicenceCreationBlockEnabled: get('HDC_LICENCE_CREATION_BLOCK', 'false', requiredInProduction) === 'true',
  pduHeadNewSearchEnabled: get('PDU_HEAD_NEW_SEARCH_ENABLED', 'false', requiredInProduction) === 'true',
  postcodeLookupEnabled: get('POSTCODE_LOOKUP_ENABLED', 'false', requiredInProduction) === 'true',
  recallsEnabled: get('RECALLS_ENABLED', 'false', requiredInProduction) === 'true',
  timeServedEnabled: get('TIME_SERVED_ENABLED', 'false', requiredInProduction) === 'true',
}
