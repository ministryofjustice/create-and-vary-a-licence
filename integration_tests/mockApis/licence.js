const { stubFor } = require('./wiremock')

module.exports = {
  stubGetLicence: ({ licenceId }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/licence/id/${licenceId}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
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
          comTelephone: '0116 2788777',
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

  // TODO: POST for createLicenceRequest with createLicenceResponse
  // TODO: Additional POSTs for each creation stage too
  // As we are working with a single licence for the creation flow - all operations relate to this licence
}
