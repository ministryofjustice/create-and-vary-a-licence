import { SuperAgentRequest } from 'superagent'
import { format, add } from 'date-fns'
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
            dateCreated: '2022-07-05 10:30:00',
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
            indeterminateSentence: false,
            receptionDate: '2021-01-08',
            locationDescription: 'Moorland (HMP & YOI)',
            restrictedPatient: false,
            conditionalReleaseDate: format(new Date(), 'yyyy-MM-dd'),
          },
        ],
      },
    })
  },

  searchPrisonersByBookingIds: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/prisoner-search/booking-ids`,
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
            indeterminateSentence: false,
            receptionDate: '2021-01-08',
            locationDescription: 'Moorland (HMP & YOI)',
            restrictedPatient: false,
            conditionalReleaseDate: format(new Date(), 'yyyy-MM-dd'),
          },
        ],
      },
    })
  },

  searchPrisonersByReleaseDate: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/prisoner-search/release-date-by-prison`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          content: [
            {
              prisonerNumber: 'G9786GC',
              bookingId: '1',
              bookNumber: '38518A',
              firstName: 'BOB',
              lastName: 'ZIMMER',
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
              indeterminateSentence: false,
              receptionDate: '2021-01-08',
              locationDescription: 'Moorland (HMP & YOI)',
              restrictedPatient: false,
              conditionalReleaseDate: format(add(new Date(), { days: 30 }), 'yyyy-MM-dd'),
            },
          ],
        },
      },
    })
  },
}
