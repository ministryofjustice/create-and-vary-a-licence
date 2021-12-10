import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'

export default {
  stubGetStaffDetails: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/secure/staff/username/USER1`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          staffIdentifier: 2000,
          staffCode: 'X12345',
          staff: {
            forenames: 'john',
            surname: 'smith',
          },
          teams: [
            {
              code: 'A',
              description: 'Team A',
              localDeliveryUnit: {
                code: 'LDU1',
                description: 'LDU one',
              },
            },
            {
              code: 'B',
              description: 'Team B',
              localDeliveryUnit: {
                code: 'LDU1',
                description: 'LDU two',
              },
            },
          ],
          telephoneNumber: '07786 989777',
          email: 'jsmith@probation.com',
        },
      },
    })
  },

  stubGetManagedOffenders: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/secure/staff/staffIdentifier/2000/managedOffenders`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            staffCode: 'NHIALLU',
            staffIdentifier: 2500012436,
            offenderId: 2500368308,
            nomsNumber: 'G9786GC',
            crnNumber: 'X344165',
            offenderSurname: 'MCGUIRE',
            currentRo: false,
            currentOm: true,
            currentPom: false,
          },
        ],
      },
    })
  },
}
