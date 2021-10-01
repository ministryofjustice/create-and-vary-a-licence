import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'

export default {
  searchPrisonersByNomisIds: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/prisoner-search/prisoner-numbers`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            prisonerNumber: 'G9786GC',
            bookingId: '1201102',
            bookNumber: '38518A',
            firstName: 'DOUGAL',
            lastName: 'MCGUIRE',
            dateOfBirth: '1940-12-20',
            gender: 'Male',
            youthOffender: false,
            status: 'ACTIVE IN',
            lastMovementTypeCode: 'ADM',
            lastMovementReasonCode: '24',
            inOutStatus: 'IN',
            prisonId: 'MDI',
            prisonName: 'Moorland (HMP & YOI)',
            cellLocation: 'RECP',
            aliases: [
              {
                firstName: 'DOUGLAS',
                lastName: 'ADORNO',
                dateOfBirth: '1939-11-19',
                gender: 'Male',
                ethnicity: 'Asian/Asian British: Indian',
              },
            ],
            alerts: [
              {
                alertType: 'H',
                alertCode: 'HA2',
                active: true,
                expired: false,
              },
            ],
            legalStatus: 'RECALL',
            imprisonmentStatus: 'CUR_ORA',
            imprisonmentStatusDescription: 'ORA Recalled from Curfew Conditions',
            recall: true,
            indeterminateSentence: false,
            receptionDate: '2021-01-08',
            locationDescription: 'Moorland (HMP & YOI)',
            restrictedPatient: false,
            conditionalReleaseDate: '09/09/2022',
          },
        ],
      },
    })
  },
}
