import { stubFor } from '../wiremock'

export default {
  stubPing: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/prison-register-api/health/ping',
      },
      response: {
        status: 200,
      },
    }),
}
