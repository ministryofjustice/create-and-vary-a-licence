import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'

export default {
  stubGetPrisonDescription: (agencyId: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prisons/id/${agencyId}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          prisonId: agencyId,
          prisonName: `Leeds HMP`,
          active: true,
        },
      },
    })
  },
}
