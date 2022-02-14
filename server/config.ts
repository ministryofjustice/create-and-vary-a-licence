import 'dotenv/config'

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
  maxSockets: 100

  maxFreeSockets: 10

  freeSocketTimeout: 30000
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
  https: production,
  staticResourceCacheDuration: 20,
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
      accessKeyId: get('SQS_PRISON_EVENTS_ACCESS_KEY_ID', 'foo', requiredInProduction),
      secretAccessKey: get('SQS_PRISON_EVENTS_SECRET_ACCESS_KEY', 'bar', requiredInProduction),
      queueUrl: get(
        'SQS_PRISON_EVENTS_QUEUE_URL',
        'http://localhost:4576/queue/create_and_vary_a_licence_prison_events_queue',
        requiredInProduction
      ),
    },
    probationEvents: {
      accessKeyId: get('SQS_PROBATION_EVENTS_ACCESS_KEY_ID', 'foo', requiredInProduction),
      secretAccessKey: get('SQS_PROBATION_EVENTS_SECRET_ACCESS_KEY', 'bar', requiredInProduction),
      queueUrl: get(
        'SQS_PROBATION_EVENTS_QUEUE_URL',
        'http://localhost:4576/queue/create_and_vary_a_licence_probation_events_queue',
        requiredInProduction
      ),
    },
    domainEvents: {
      accessKeyId: get('SQS_DOMAIN_EVENTS_ACCESS_KEY_ID', 'foo', requiredInProduction),
      secretAccessKey: get('SQS_DOMAIN_EVENTS_SECRET_ACCESS_KEY', 'bar', requiredInProduction),
      queueUrl: get(
        'SQS_DOMAIN_EVENTS_QUEUE_URL',
        'http://localhost:4576/queue/create_and_vary_a_licence_domain_events_queue',
        requiredInProduction
      ),
    },
  },
  apis: {
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(),
      apiClientId: get('API_CLIENT_ID', 'create-and-vary-a-licence-client', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      systemClientId: get('SYSTEM_CLIENT_ID', 'create-and-vary-a-licence-admin', requiredInProduction),
      systemClientSecret: get('SYSTEM_CLIENT_SECRET', 'client_secret', requiredInProduction),
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(),
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
    licenceApi: {
      url: get('LICENCE_API_URL', 'http://localhost:8089', requiredInProduction),
      timeout: {
        response: get('LICENCE_API_TIMEOUT_RESPONSE', 30000),
        deadline: get('LICENCE_API_TIMEOUT_DEADLINE', 30000),
      },
      agent: new AgentConfig(),
    },
    prisonApi: {
      url: get('PRISON_API_URL', 'http://localhost:8080', requiredInProduction),
      timeout: {
        response: get('PRISON_API_TIMEOUT_RESPONSE', 10000),
        deadline: get('PRISON_API_TIMEOUT_DEADLINE', 10000),
      },
      agent: new AgentConfig(),
    },
    prisonerSearchApi: {
      url: get('PRISONER_SEARCH_API_URL', 'http://localhost:8090', requiredInProduction),
      timeout: {
        response: get('PRISONER_SEARCH_API_TIMEOUT_RESPONSE', 10000),
        deadline: get('PRISONER_SEARCH_API_TIMEOUT_DEADLINE', 10000),
      },
      agent: new AgentConfig(),
    },
    prisonRegisterApi: {
      url: get('PRISON_REGISTER_API_URL', 'http://localhost:8092', requiredInProduction),
      timeout: {
        response: get('PRISON_REGISTER_API_TIMEOUT_RESPONSE', 10000),
        deadline: get('PRISON_REGISTER_API_TIMEOUT_DEADLINE', 10000),
      },
      agent: new AgentConfig(),
    },
    probationSearchApi: {
      url: get('PROBATION_SEARCH_API_URL', 'http://localhost:8091', requiredInProduction),
      timeout: {
        response: get('PROBATION_SEARCH_API_TIMEOUT_RESPONSE', 10000),
        deadline: get('PROBATION_SEARCH_API_TIMEOUT_DEADLINE', 10000),
      },
      agent: new AgentConfig(),
    },
    communityApi: {
      url: get('COMMUNITY_API_URL', 'http://localhost:8088', requiredInProduction),
      timeout: {
        response: get('COMMUNITY_API_TIMEOUT_RESPONSE', 10000),
        deadline: get('COMMUNITY_API_TIMEOUT_DEADLINE', 10000),
      },
      agent: new AgentConfig(),
    },
    gotenberg: {
      apiUrl: get('GOTENBERG_API_URL', 'http://localhost:3001', requiredInProduction),
      pdfOptions: {
        marginTop: '0.8',
        marginBottom: '0.7',
        marginLeft: '0.55',
        marginRight: '0.35',
      },
      watermark: get('LICENCE_WATERMARK', false),

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
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  exitSurveyLink: get('EXIT_SURVEY_LINK', 'https://exit-survey-placeholder-link', requiredInProduction),
  phaseBannerLink: get('PHASE_BANNER_LINK', 'https://phase-banner-placeholder-link', requiredInProduction),
  qrCodesEnabled: get('QR_CODES_ENABLED', false),
  analytics: {
    tagManagerContainerId: get('TAG_MANAGER_CONTAINER_ID', ''),
  },
  rollout: {
    restricted: get('RESTRICT_ROLLOUT', false),
    probationAreas: ['N55'],
    prisons: ['MDI', 'LEI'],
  },
}
