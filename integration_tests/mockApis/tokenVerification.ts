import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'

export default {
  stubTokenVerificationPing: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/verification-api/health/ping',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),
  stubVerifyToken: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: '/verification-api/token/verify',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { active: 'true' },
      },
    })
  },
}
