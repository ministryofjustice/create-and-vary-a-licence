import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'
import { GetLicenceArgs } from '../types/testArguments'

export default {
  stubGetLicence: (args: GetLicenceArgs): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licence/id/${args.licenceId}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          id: 1,
          typeCode: 'AP',
          version: '1.1',
          statusCode: args.licenceStatus,
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
          comTelephone: null,
          probationAreaCode: 'N01',
          probationLduCode: 'LDU1',
          dateCreated: '10/009/2021 10:00:00', // Make dynamic to now?
          createdByUsername: 'X12345',
          standardConditions: [
            { id: 1, code: 'goodBehaviour', sequence: 1, text: 'Be of good behaviour' },
            { id: 2, code: 'notBreakLaw', sequence: 2, text: 'Do not break the law' },
            { id: 3, code: 'attendMeetings', sequence: 3, text: 'Attend arranged meetings' },
          ],
          additionalConditions: [],
          bespokeConditions: [],
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

  stubPutAppointmentPerson: (licenceId: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licence/id/${licenceId}/appointmentPerson`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubPutAppointmentTime: (licenceId: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licence/id/${licenceId}/appointmentTime`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubPutAppointmentAddress: (licenceId: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licence/id/${licenceId}/appointment-address`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubPutContactNumber: (licenceId: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licence/id/${licenceId}/contact-number`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubPutBespokeConditions: (licenceId: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licence/id/${licenceId}/bespoke-conditions`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubGetLicencesByStaffIdAndStatus: (staffId: number): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/licence/staffId/${staffId}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [],
      },
    })
  },

  stubGetLicencesForApproval: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/licence/approval-candidates`,
        queryParameters: {
          prison: {
            matches: '.*',
          },
        },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            licenceId: 1,
            licenceType: 'AP',
            licenceStatus: 'SUBMITTED',
            nomisId: 'A1234AA',
            surname: 'Zimmer',
            forename: 'Bob',
            prisonCode: 'MDI',
            prisonDescription: 'Moorland (HMP)',
            conditionalReleaseDate: '12/12/2022',
            actualReleaseDate: '01/02/2023',
            crn: 'X12345',
            dateOfBirth: '25/12/2000',
          },
        ],
      },
    })
  },

  stubUpdateLicenceStatus: (licenceId: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/licence/id/${licenceId}/status`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },
}
