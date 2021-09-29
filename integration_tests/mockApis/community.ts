import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'

export default {
  stubGetManagedOffenders: (staffId: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/secure/staff/staffIdentifier/${staffId}/managedOffenders`,
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
            offenderSurname: 'Balasaravika',
            currentRo: true,
            currentOm: false,
            currentPom: true,
          },
        ],
      },
    })
  },
}
