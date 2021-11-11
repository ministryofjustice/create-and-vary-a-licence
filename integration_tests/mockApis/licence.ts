import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'

const licencePlaceholder = {
  id: 1,
  typeCode: 'AP',
  version: '1.1',
  statusCode: 'IN_PROGRESS',
  nomsId: 'A1234AA',
  bookingNo: '123456',
  bookingId: '54321',
  crn: 'X12345',
  pnc: '2019/123445',
  cro: '12345',
  prisonCode: 'LEI',
  prisonDescription: 'Leeds (HMP)',
  forename: 'Bob',
  surname: 'Zimmer',
  dateOfBirth: '12/02/1980',
  conditionalReleaseDate: '13/03/2021',
  actualReleaseDate: '01/04/2021',
  sentenceStartDate: '10/01/2019',
  sentenceEndDate: '26/04/2022',
  licenceStartDate: '01/04/2021',
  licenceExpiryDate: '26/04/2022',
  comFirstName: 'Stephen',
  comLastName: 'Mills',
  comUsername: 'X12345',
  comStaffId: '12345',
  comEmail: 'stephen.mills@nps.gov.uk',
  probationAreaCode: 'N01',
  probationLduCode: 'LDU1',
  dateCreated: '10/09/2021 10:00:00', // Make dynamic to now?
  createdByUsername: 'X12345',
  standardLicenceConditions: [
    { id: 1, code: 'goodBehaviour', sequence: 1, text: 'Be of good behaviour' },
    { id: 2, code: 'notBreakLaw', sequence: 2, text: 'Do not break the law' },
    { id: 3, code: 'attendMeetings', sequence: 3, text: 'Attend arranged meetings' },
  ],
  additionalLicenceConditions: [],
  bespokeConditions: [],
}

export default {
  stubGetLicence: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licence/id/(\\d)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: licencePlaceholder,
      },
    })
  },

  stubGetCompletedLicence: (statusCode: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licence/id/(\\d)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...licencePlaceholder,
          statusCode, // Overrides licencePlaceHolder status
          appointmentPerson: 'Isaac Newton',
          appointmentAddress: 'Down the road, over there',
          comTelephone: '07891245678',
          appointmentTime: '01/12/2021 00:34',
          additionalLicenceConditions: [
            {
              id: 1,
              code: '5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd',
              category: 'Residence at a specific place',
              sequence: 0,
              text: 'You must reside within [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
              data: [
                {
                  id: 1,
                  sequence: 0,
                  field: 'probationRegion',
                  value: 'London',
                },
              ],
            },
            {
              id: 2,
              code: 'fce34fb2-02f4-4eb0-9b8d-d091e11451fa',
              category: 'Restriction of residency',
              sequence: 1,
              text: 'Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.',
              data: [
                {
                  id: 2,
                  sequence: 0,
                  field: 'gender',
                  value: 'Any',
                },
                {
                  id: 3,
                  sequence: 0,
                  field: 'age',
                  value: '16',
                },
              ],
            },
            {
              id: 3,
              code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
              category: 'Participation in, or co-operation with, a programme or set of activities',
              sequence: 2,
              text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your [ALCOHOL / DRUG / SEXUAL / VIOLENT / GAMBLING / SOLVENT ABUSE / ANGER / DEBT / PROLIFIC / OFFENDING BEHAVIOUR] problems.',
              data: [
                {
                  id: 4,
                  sequence: 0,
                  field: 'behaviourProblems',
                  value: 'gambling',
                },
                {
                  id: 5,
                  sequence: 1,
                  field: 'behaviourProblems',
                  value: 'debt',
                },
              ],
            },
            {
              id: 4,
              code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
              category: 'Participation in, or co-operation with, a programme or set of activities',
              sequence: 3,
              text: 'Confine yourself to an address approved by your supervising officer between the hours of [TIME] and [TIME] daily unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.',
              data: [
                {
                  id: 6,
                  sequence: 0,
                  field: 'curfewStart',
                  value: '7:30pm',
                },
                {
                  id: 7,
                  sequence: 1,
                  field: 'curfewEnd',
                  value: '7:30am',
                },
                {
                  id: 8,
                  sequence: 2,
                  field: 'reviewPeriod',
                  value: 'Other',
                },
                {
                  id: 9,
                  sequence: 3,
                  field: 'alternativeReviewPeriod',
                  value: 'Annually',
                },
              ],
            },
            {
              id: 5,
              code: '3932e5c9-4d21-4251-a747-ce6dc52dc9c0',
              category: 'Possession, ownership, control or inspection of specified items or documents',
              sequence: 4,
              text: 'Not to own or possess a [SPECIFIED ITEM] without the prior approval of your supervising officer.',
              data: [
                {
                  id: 10,
                  sequence: 0,
                  field: 'item',
                  value: 'Knives',
                },
                {
                  id: 11,
                  sequence: 1,
                  field: 'item',
                  value: 'Needles',
                },
              ],
            },
          ],
          bespokeConditions: [
            {
              id: 133,
              sequence: 0,
              text: 'Bespoke condition 1',
            },
            {
              id: 134,
              sequence: 1,
              text: 'Bespoke condition 2',
            },
          ],
        },
      },
    })
  },

  stubPostLicence: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: '/licence/create',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          licenceId: 1,
          licenceType: 'AP',
          licenceStatus: 'IN_PROGRESS',
        },
      },
    })
  },

  stubPutAppointmentPerson: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licence/id/(\\d)*/appointmentPerson`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubPutAppointmentTime: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licence/id/(\\d)*/appointmentTime`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubPutAppointmentAddress: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licence/id/(\\d)*/appointment-address`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubPutContactNumber: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licence/id/(\\d)*/contact-number`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubPutBespokeConditions: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licence/id/(\\d)*/bespoke-conditions`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubPutAdditionalConditions: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licence/id/(\\d)*/additional-conditions`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubGetLicenceWithConditionToComplete: (code: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licence/id/(\\d)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...licencePlaceholder,
          additionalLicenceConditions: [
            {
              id: 1,
              code,
              data: [],
            },
          ],
        },
      },
    })
  },

  stubPutAdditionalConditionData: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licence/id/(\\d)*/additional-conditions/condition/(\\d)*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubGetLicencesByStaffIdAndStatus: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/licence/staffId/2000`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [],
      },
    })
  },

  stubGetLicencesForStatus: (status: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/licence/match`,
        queryParameters: {
          prison: {
            matches: '.*',
          },
          status: {
            matches: '.*',
          },
        },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            licenceId: licencePlaceholder.id,
            licenceType: licencePlaceholder.typeCode,
            licenceStatus: status,
            nomisId: licencePlaceholder.nomsId,
            surname: licencePlaceholder.surname,
            forename: licencePlaceholder.forename,
            prisonCode: licencePlaceholder.prisonCode,
            prisonDescription: licencePlaceholder.prisonDescription,
            conditionalReleaseDate: licencePlaceholder.conditionalReleaseDate,
            actualReleaseDate: licencePlaceholder.actualReleaseDate,
            crn: licencePlaceholder.crn,
            dateOfBirth: licencePlaceholder.dateOfBirth,
          },
        ],
      },
    })
  },

  stubUpdateLicenceStatus: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licence/id/(\\d*)/status`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },
}
