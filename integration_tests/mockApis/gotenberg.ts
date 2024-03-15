import { stubFor } from '../wiremock'

export default {
  stubPing: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/gotenberg-api/health',
      },
      response: {
        status: 200,
      },
    }),
}
