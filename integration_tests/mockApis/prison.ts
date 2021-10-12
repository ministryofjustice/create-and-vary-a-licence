import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'

export default {
  stubGetPrisonerDetail: (nomisId: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/offenders/${nomisId}`,
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
}
