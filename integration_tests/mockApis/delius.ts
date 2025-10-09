import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'
import { DeliusManager } from '../../server/@types/deliusClientTypes'

export default {
  stubGetProbationer: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/delius-api/probation-case/.*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          crn: 'X2345',
        },
      },
    })
  },

  stubGetProbationers: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/delius-api/probation-case`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            crn: 'X2345',
          },
          {
            crn: 'X344165',
            nomisId: 'G9786GC',
          },
        ],
      },
    })
  },

  stubGetStaffDetails: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/delius-api/staff/.*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          id: 2000,
          code: 'X12345',
          name: {
            forename: 'John',
            surname: 'Smith',
          },
          provider: {
            code: 'N01',
            description: 'Area N01',
          },
          teams: [
            {
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
            {
              code: 'B',
              description: 'Team B',
              borough: {
                code: 'PDU1',
                description: 'PDU one',
              },
              district: {
                code: 'LAU1',
                description: 'LAU one',
              },
            },
          ],
          telephoneNumber: '07786 989777',
          email: 'jsmith@probation.com',
          username: 'jsmith',
        },
      },
    })
  },

  stubGetStaffDetailsByStaffCode: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/delius-api/staff/bycode/(.)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          id: 2000,
          code: 'X12345',
          name: {
            forename: 'John',
            surname: 'Smith',
          },
          provider: {
            code: 'N01',
            description: 'Area N01',
          },
          teams: [
            {
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
            {
              code: 'B',
              description: 'Team B',
              borough: {
                code: 'PDU1',
                description: 'PDU one',
              },
              district: {
                code: 'LAU1',
                description: 'LAU one',
              },
            },
          ],
          telephoneNumber: '07786 989777',
          email: 'jsmith@probation.com',
          username: 'jsmith',
        },
      },
    })
  },

  stubAssignRole: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/delius-api/users/(.)*/roles`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubGetPduHeads: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/delius-api/staff/.*/pdu-head`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [],
      },
    })
  },

  stubGetResponsibleCommunityManager: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/delius-api/probation-case/(.*)/responsible-community-manager`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          id: 2000,
          code: 'X12345',
          case: { crn: 'X2345' },
          name: {
            forename: 'John',
            surname: 'Smith',
          },
          provider: {
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
          username: 'jsmith',
          telephoneNumber: '07786 989777',
          email: 'jsmith@probation.com',
          unallocated: false,
        } as DeliusManager,
      },
    })
  },

  stubGetResponsibleCommunityManagers: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/delius-api/probation-case/responsible-community-manager`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            id: 2000,
            code: 'X12345',
            case: { crn: 'X2345' },
            name: {
              forename: 'John',
              surname: 'Smith',
            },
            provider: {
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
            username: 'jsmith',
            telephoneNumber: '07786 989777',
            email: 'jsmith@probation.com',
            unallocated: false,
          } as DeliusManager,
        ],
      },
    })
  },

  stubPing: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/delius-api/health/ping',
      },
      response: {
        status: 200,
      },
    }),
}
