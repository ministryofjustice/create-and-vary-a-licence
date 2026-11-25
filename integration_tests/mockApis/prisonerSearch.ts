import { stubFor } from '../wiremock'

export default {
  stubPing: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/prisoner-search-api/health/ping',
      },
      response: {
        status: 200,
      },
    }),
}
