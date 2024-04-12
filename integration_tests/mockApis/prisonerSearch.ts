import { SuperAgentRequest } from 'superagent'
import { addDays, addMonths, format } from 'date-fns'
import { stubFor } from '../wiremock'

const nextMonth = format(addMonths(new Date(), 1), 'yyyy-MM-dd')
const nextThirtyDays = format(addDays(new Date(), 30), 'yyyy-MM-dd')

export default {
  searchPrisonersByNomisIds: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/prisoner-search-api/prisoner-search/prisoner-numbers`,
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
            conditionalReleaseDate: nextMonth,
          },
        ],
      },
    })
  },

  searchPrisonersByBookingIds: (): SuperAgentRequest => {
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
            cvl: {
              licenceType: 'AP',
              hardStopDate: '03/01/2023',
              hardStopWarningDate: '01/01/2023',
              isInHardStopPeriod: true,
              isDueForEarlyRelease: true,
            },
            prisoner: {
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
              conditionalReleaseDate: nextMonth,
            },
          },
        ],
      },
    })
  },

  searchPrisonersByReleaseDate: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/prisoner-search-api/prisoner-search/release-date-by-prison`,
        queryParameters: {
          size: {
            equalTo: '2000',
          },
        },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            cvl: {
              licenceType: 'AP',
              hardStopDate: '03/01/2023',
              hardStopWarningDate: '01/01/2023',
              isInHardStopPeriod: true,
              isDueForEarlyRelease: true,
            },
            prisoner: {
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
              conditionalReleaseDate: nextThirtyDays,
            },
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
