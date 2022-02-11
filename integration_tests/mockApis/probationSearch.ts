import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'

export default {
  stubGetProbationer: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/search`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            otherIds: {
              crn: 'X2345',
              pncNumber: '1234/12345',
              croNumber: '1/12345',
            },
            offenderManagers: [
              {
                active: true,
                staff: {
                  forenames: 'Joe',
                  surname: 'Bloggs',
                },
              },
            ],
          },
        ],
      },
    })
  },
}
