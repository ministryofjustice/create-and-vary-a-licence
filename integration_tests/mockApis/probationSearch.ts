import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'

export default {
  stubGetProbationer: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/probation-search-api/search`,
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
                  code: 'X12345',
                  forenames: 'Joe',
                  surname: 'Bloggs',
                },
                probationArea: {
                  code: 'N01',
                  description: 'Area N01',
                },
                team: {
                  code: 'A',
                  description: 'Team A',
                  borough: {
                    code: 'PDU1',
                    description: 'PDU one',
                  },
                  district: {
                    code: 'LAU1',
                    description: 'LAU one',
                  },
                },
              },
            ],
          },
        ],
      },
    })
  },

  stubGetOffendersByCrn: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/probation-search-api/crns`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            otherIds: {
              crn: 'X344165',
              pncNumber: '1234/12345',
              croNumber: '1/12345',
              nomsNumber: 'G9786GC',
            },
            offenderManagers: [
              {
                active: true,
                staff: {
                  forenames: 'Joe',
                  surname: 'Bloggs',
                },
                probationArea: {
                  code: 'N01',
                  description: 'Area N01',
                },
                team: {
                  code: 'A',
                  description: 'Team A',
                  borough: {
                    code: 'PDU1',
                    description: 'PDU one',
                  },
                  district: {
                    code: 'LAU1',
                    description: 'LAU one',
                  },
                },
              },
            ],
          },
        ],
      },
    })
  },

  stubGetOffendersByNomsNumber: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/probation-search-api/nomsNumbers`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            otherIds: {
              crn: 'X344165',
              pncNumber: '1234/12345',
              croNumber: '1/12345',
              nomsNumber: 'G9786GC',
            },
            offenderManagers: [
              {
                active: true,
                staff: {
                  forenames: 'Joe',
                  surname: 'Bloggs',
                },
                probationArea: {
                  code: 'N01',
                  description: 'Area N01',
                },
                team: {
                  code: 'A',
                  description: 'Team A',
                  borough: {
                    code: 'PDU1',
                    description: 'PDU one',
                  },
                  district: {
                    code: 'LAU1',
                    description: 'LAU one',
                  },
                },
              },
            ],
          },
        ],
      },
    })
  },

  stubPing: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/probation-search-api/health/ping',
      },
      response: {
        status: 200,
      },
    }),
}
