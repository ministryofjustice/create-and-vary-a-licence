import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'

export default {
  stubGetPrisonerDetail: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison-api/api/offenders/G9786GC`,
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
            sentenceStartDate: '2023-04-15',
          },
        },
      },
    })
  },

  stubGetRecalledPrisonerDetail: (prrd: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison-api/api/offenders/G9786GC`,
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
            postRecallReleaseDate: prrd,
          },
        },
      },
    })
  },

  stubGetPrisonerSentencesAndOffences: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison-api/api/offender-sentences/booking/1234/sentences-and-offences`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            bookingId: 1234,
            sentenceSequence: 1,
            lineSequence: 1,
            caseSequence: 1,
            caseReference: 'ABC123',
            courtDescription: 'A court',
            sentenceStatus: 'A',
            sentenceCategory: '1984',
            sentenceCalculationType: 'ABC',
            sentenceTypeDescription: 'Standard Determinate Sentence',
            sentenceDate: '2021-09-27',
            terms: [
              {
                years: 0,
                months: 15,
                weeks: 0,
                days: 0,
                code: 'IMP',
              },
            ],
            offences: [
              {
                offenderChargeId: 5678,
                offenceStartDate: '2021-05-02',
                offenceCode: 'AB1234',
                offenceDescription: 'offence',
                indicators: ['912', 'ABC'],
              },
            ],
          },
          {
            bookingId: 1234,
            sentenceSequence: 2,
            lineSequence: 2,
            caseSequence: 1,
            caseReference: 'case ref',
            courtDescription: 'Some court',
            sentenceStatus: 'A',
            sentenceCategory: '2020',
            sentenceCalculationType: 'calc type',
            sentenceTypeDescription: 'type description',
            sentenceDate: '2021-09-27',
            terms: [
              {
                years: 0,
                months: 20,
                weeks: 0,
                days: 0,
                code: 'IMP',
              },
            ],
            offences: [
              {
                offenderChargeId: 6788948,
                offenceStartDate: '2022-05-02',
                offenceCode: 'BF4343',
                offenceDescription: 'did something wrong',
                indicators: ['12', 'GHIJ', 'A', 'X'],
              },
            ],
          },
          {
            bookingId: 1234,
            sentenceSequence: 2,
            lineSequence: 2,
            caseSequence: 2,
            caseReference: 'case ref',
            courtDescription: 'another court',
            sentenceStatus: 'A',
            sentenceCategory: '2020',
            sentenceCalculationType: 'calc type',
            sentenceTypeDescription: 'type desc 2',
            sentenceDate: '2023-04-27',
            terms: [
              {
                years: 0,
                months: 0,
                weeks: 0,
                days: 15,
                code: 'IMP',
              },
            ],
            offences: [
              {
                offenderChargeId: 4355345,
                offenceCode: 'ABC1243',
                offenceDescription: 'offence desc',
                indicators: ['456'],
              },
            ],
            fineAmount: 9999999.12,
          },
        ],
      },
    })
  },

  stubGetPrisonerSentencesAndOffencesWithPastSsd: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison-api/api/offender-sentences/booking/1234/sentences-and-offences`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            bookingId: 1234,
            sentenceSequence: 1,
            lineSequence: 1,
            caseSequence: 1,
            caseReference: 'ABC123',
            courtDescription: 'A court',
            sentenceStatus: 'A',
            sentenceCategory: '1984',
            sentenceCalculationType: 'ABC',
            sentenceTypeDescription: 'Standard Determinate Sentence',
            sentenceDate: '2021-09-27',
            terms: [
              {
                years: 0,
                months: 15,
                weeks: 0,
                days: 0,
                code: 'IMP',
              },
            ],
            offences: [
              {
                offenderChargeId: 5678,
                offenceStartDate: '2021-05-02',
                offenceCode: 'AB1234',
                offenceDescription: 'offence',
                indicators: ['912', 'ABC'],
              },
            ],
          },
        ],
      },
    })
  },

  stubGetPrisonInformation: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison-api/api/agencies/prison/.*`,
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
        urlPattern: `/prison-api/api/users/me`,
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
        urlPattern: `/prison-api/api/offender-sentences/home-detention-curfews/latest`,
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

  stubGetUserCaseloads: (caseload): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison-api/api/users/me/caseLoads`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: caseload.details,
      },
    })
  },

  stubGetPrisons: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/prison-api/api/agencies/type/INST\\?active=true',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            agencyId: 'LEI',
            agencyType: 'INST',
            description: 'Leeds (HMP)',
            active: true,
          },
          {
            agencyId: 'BMI',
            agencyType: 'INST',
            description: 'Birmingham (HMP)',
            active: true,
          },
          {
            agencyId: 'MDI',
            agencyType: 'INST',
            description: 'Moorland (HMP)',
            active: true,
          },
          {
            agencyId: 'BXI',
            agencyType: 'INST',
            description: 'Brixton (HMP)',
            active: true,
          },
          {
            agencyId: 'BAI',
            agencyType: 'INST',
            description: 'Belmarsh (HMP)',
            active: true,
          },
        ],
      },
    })
  },

  stubPing: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/prison-api/health/ping',
      },
      response: {
        status: 200,
      },
    }),

  stubGetPrisonerImage: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison-api/api/bookings/offenderNo/.*?/image/data`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'image/jpeg' },
        jsonBody: {},
      },
    })
  },

  stubGetHdcLicencesForOffender: (options: { bookingId: number; status: string }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/prison-api/api/offender-sentences/booking/(\\d)*/home-detention-curfews/latest',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          approvalStatus: options.status,
          approvalStatusDate: null,
          bookingId: options.bookingId,
          checksPassedDate: null,
          passed: true,
          refusedReason: '',
        },
      },
    })
  },
}
