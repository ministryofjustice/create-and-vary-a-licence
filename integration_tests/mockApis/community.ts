import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'

export default {
  stubGetStaffDetails: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/secure/staff/username/(.)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          staffIdentifier: 2000,
          staffCode: 'X12345',
          staff: {
            forenames: 'John',
            surname: 'Smith',
          },
          probationArea: {
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
        },
      },
    })
  },

  stubGetStaffDetailsByStaffId: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/secure/staff/staffIdentifier/(\\d)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          staffIdentifier: 2000,
          staffCode: 'X12345',
          staff: {
            forenames: 'John',
            surname: 'Smith',
          },
          probationArea: {
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

  stubGetStaffDetailsByList: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/secure/staff/list`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            staffIdentifier: 2000,
            staffCode: 'X12345',
            staff: {
              forenames: 'John',
              surname: 'Smith',
            },
            probationArea: {
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
        ],
      },
    })
  },

  stubGetManagedOffenders: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/secure/staff/staffIdentifier/2000/caseload/managedOffenders`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            offenderCrn: 'X344165',
            staffIdentifier: 2500012436,
            crnNumber: 'X344165',
          },
        ],
      },
    })
  },

  stubGetAnOffendersManagers: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/secure/offenders/crn/(.)*/allOffenderManagers`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            isResponsibleOfficer: true,
            staffId: 2000,
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
    })
  },
}
