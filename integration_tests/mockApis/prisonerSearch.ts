import { SuperAgentRequest } from 'superagent'
import { addMonths, format } from 'date-fns'
import { stubFor } from '../wiremock'

const nextMonth = format(addMonths(new Date(), 1), 'yyyy-MM-dd')

export default {
  searchPrisonersByBookingIds: (hdcad?: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/prisoner-search-api/prisoner-search/booking-ids`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            prisonerNumber: 'G9786GC',
            bookingId: '1201102',
            bookNumber: '38518A',
            firstName: 'TEST',
            lastName: 'PERSON',
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
                firstName: 'OTHER',
                lastName: 'NAME',
                dateOfBirth: '1939-11-19',
                gender: 'Male',
                ethnicity: 'Some ethnicity',
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
            indeterminateSentence: false,
            receptionDate: '2021-01-08',
            locationDescription: 'Moorland (HMP & YOI)',
            restrictedPatient: false,
            conditionalReleaseDate: nextMonth,
            homeDetentionCurfewActualDate: hdcad,
          },
        ],
      },
    })
  },

  stubPing: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/prisoner-search-api/health/ping',
      },
      response: {
        status: 200,
      },
    }),
}
