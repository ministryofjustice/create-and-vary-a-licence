import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'

export default {
  stubGetPrisonerDetail: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/offenders/G9786GC`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          bookingNo: '1234',
          bookingId: '1234',
          agencyId: 'BMI',
          firstName: 'DOUGAL',
          middleName: 'JP',
          lastName: 'MCGUIRE',
          dateOfBirth: '1950-05-28',
          sentenceDetail: {
            conditionalReleaseDate: '2022-11-10',
          },
        },
      },
    })
  },

  stubGetPrisonInformation: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/agencies/prison/.*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          formattedDescription: 'Leeds (HMP)',
          phones: [
            {
              type: 'BUS',
              number: '08003458761',
            },
          ],
        },
      },
    })
  },

  stubGetUserDetails: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/users/me`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          accountStatus: 'ACTIVE',
          active: true,
          activeCaseLoadId: 'LEI',
          expiredFlag: false,
          firstName: 'john',
          lastName: 'smith',
          lockedFlag: false,
          staffId: 231232,
          username: 'USER1',
        },
      },
    })
  },

  stubGetHdcStatus: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/api/offender-sentences/home-detention-curfews/latest`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            approvalStatus: 'REJECTED',
            approvalStatusDate: '12/12/2022',
            checksPassedDate: '12/12/2022',
            passed: true,
            bookingId: 1,
          },
        ],
      },
    })
  },

  stubGetUserCaseloads: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/users/me/caseLoads`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            caseLoadId: 'LEI',
            caseloadFunction: 'GENERAL',
            currentlyActive: true,
            description: 'Leeds (HMP)',
            type: 'INST',
          },
        ],
      },
    })
  },
}
