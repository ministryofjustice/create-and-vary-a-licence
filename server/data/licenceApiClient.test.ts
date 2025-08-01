import { Readable } from 'stream'
import { Buffer } from 'buffer'
import LicenceApiClient from './licenceApiClient'
import {
  AdditionalConditionsRequest,
  AppointmentAddressRequest,
  AppointmentPersonRequest,
  AppointmentTimeRequest,
  AuditEvent,
  AuditRequest,
  BespokeConditionsRequest,
  ContactNumberRequest,
  Licence,
  LicenceSummary,
  ReferVariationRequest,
  StatusUpdateRequest,
  UpdateAdditionalConditionDataRequest,
  UpdateComRequest,
  UpdatePrisonUserRequest,
  UpdatePrisonInformationRequest,
  UpdateProbationTeamRequest,
  UpdateReasonForVariationRequest,
  UpdateSpoDiscussionRequest,
  UpdateVloDiscussionRequest,
  CaCaseloadSearch,
  LicenceCreationResponse,
  OverrideLicencePrisonerDetailsRequest,
  UpdateElectronicMonitoringProgrammeRequest,
  AddAddressRequest,
} from '../@types/licenceApiClientTypes'
import HmppsRestClient from './hmppsRestClient'
import LicenceStatus from '../enumeration/licenceStatus'
import { User } from '../@types/CvlUserDetails'
import LicenceEventType from '../enumeration/licenceEventType'
import { InMemoryTokenStore } from './tokenStore'
import logger from '../../logger'
import { parseCvlDate } from '../utils/utils'

const licenceApiClient = new LicenceApiClient(
  new InMemoryTokenStore(async _username => ({ token: 'token-1', expiresIn: 1234 })),
)

jest.mock('../../logger')

describe('Licence API client tests', () => {
  const get = jest.spyOn(HmppsRestClient.prototype, 'get')
  const post = jest.spyOn(HmppsRestClient.prototype, 'post')
  const put = jest.spyOn(HmppsRestClient.prototype, 'put')
  const stream = jest.spyOn(HmppsRestClient.prototype, 'stream')
  const postMultiPart = jest.spyOn(HmppsRestClient.prototype, 'postMultiPart')
  const del = jest.spyOn(HmppsRestClient.prototype, 'delete')

  beforeEach(() => {
    get.mockResolvedValue(true)
    post.mockResolvedValue(true)
    put.mockResolvedValue(true)
    postMultiPart.mockResolvedValue(true)
    del.mockResolvedValue(true)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Create licence request', async () => {
    post.mockResolvedValue({ licenceId: 1 } as LicenceCreationResponse)

    const creationRequest = { nomsId: 'A1234AA', type: 'CRD' as const }
    const result = await licenceApiClient.createLicence(creationRequest, { username: 'joebloggs' } as User)

    expect(post).toHaveBeenCalledWith(
      { path: '/licence/create', data: creationRequest, returnBodyOnErrorIfPredicate: expect.any(Function) },
      { username: 'joebloggs' },
    )
    expect(result).toEqual({ licenceId: 1 })
  })

  it('Create licence request when resouce already exists', async () => {
    post.mockResolvedValue({ status: 409, existingResourceId: 3 })

    const creationRequest = { nomsId: 'A1234AA', type: 'CRD' as const }
    const result = await licenceApiClient.createLicence(creationRequest, { username: 'joebloggs' } as User)

    expect(post).toHaveBeenCalledWith(
      { path: '/licence/create', data: creationRequest, returnBodyOnErrorIfPredicate: expect.any(Function) },
      { username: 'joebloggs' },
    )
    expect(result).toEqual({ licenceId: 3 })
  })

  it('Get licence by Id', async () => {
    get.mockResolvedValue({ id: 1, prisonCode: 'MDI' } as Licence)

    const result = await licenceApiClient.getLicenceById(1, { username: 'joebloggs' } as User)

    expect(get).toHaveBeenCalledWith({ path: '/licence/id/1' }, { username: 'joebloggs' })
    expect(result).toEqual({ id: 1, prisonCode: 'MDI' })
  })

  it('Update appointment person', async () => {
    await licenceApiClient.updateAppointmentPerson(
      '1',
      { appointmentPerson: 'Joe Bloggs' } as AppointmentPersonRequest,
      { username: 'joebloggs' } as User,
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/appointmentPerson', data: { appointmentPerson: 'Joe Bloggs' } },
      { username: 'joebloggs' },
    )
  })

  it('Update appointment time', async () => {
    await licenceApiClient.updateAppointmentTime(
      '1',
      { appointmentTime: '12:30pm' } as AppointmentTimeRequest,
      { username: 'joebloggs' } as User,
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/appointmentTime', data: { appointmentTime: '12:30pm' } },
      { username: 'joebloggs' },
    )
  })

  it('Update appointment address', async () => {
    await licenceApiClient.updateAppointmentAddress(
      '1',
      { appointmentAddress: '123 Fake Street' } as AppointmentAddressRequest,
      { username: 'joebloggs' } as User,
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/appointment-address', data: { appointmentAddress: '123 Fake Street' } },
      { username: 'joebloggs' },
    )
  })

  it('Add appointment address', async () => {
    const addAddressRequest: AddAddressRequest = {
      firstLine: '123 Fake Street',
      secondLine: 'Flat 1',
      townOrCity: 'Faketown',
      postcode: 'FK1 2AB',
      county: 'Westshire',
      source: 'MANUAL',
    }
    await licenceApiClient.addAppointmentAddress('1', addAddressRequest, { username: 'joebloggs' } as User)
    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/appointment/address', data: addAddressRequest },
      { username: 'joebloggs' },
    )
  })

  it('Update contact number', async () => {
    await licenceApiClient.updateContactNumber(
      '1',
      { telephone: '0112877368' } as ContactNumberRequest,
      { username: 'joebloggs' } as User,
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/contact-number', data: { telephone: '0112877368' } },
      { username: 'joebloggs' },
    )
  })

  it('Update bespoke conditions', async () => {
    await licenceApiClient.updateBespokeConditions(
      '1',
      { conditions: ['Not to enter any shopping centres'] } as BespokeConditionsRequest,
      { username: 'joebloggs' } as User,
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/bespoke-conditions', data: { conditions: ['Not to enter any shopping centres'] } },
      { username: 'joebloggs' },
    )
  })

  it('Update additional conditions', async () => {
    await licenceApiClient.updateAdditionalConditions(
      1,
      { additionalConditions: [{ code: 'condition1' }] } as AdditionalConditionsRequest,
      { username: 'joebloggs' } as User,
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/additional-conditions', data: { additionalConditions: [{ code: 'condition1' }] } },
      { username: 'joebloggs' },
    )
  })

  it('Update additional condition data', async () => {
    await licenceApiClient.updateAdditionalConditionData(
      '1',
      '2',
      { data: [{ value: 'condition1' }] } as UpdateAdditionalConditionDataRequest,
      { username: 'joebloggs' } as User,
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/additional-conditions/condition/2', data: { data: [{ value: 'condition1' }] } },
      { username: 'joebloggs' },
    )
  })

  it('Update licence status', async () => {
    await licenceApiClient.updateLicenceStatus(
      1,
      { status: 'IN_PROGRESS' } as StatusUpdateRequest,
      { username: 'joebloggs' } as User,
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/status', data: { status: 'IN_PROGRESS' } },
      { username: 'joebloggs' },
    )
  })

  it('Submit licence', async () => {
    await licenceApiClient.submitLicence('1', [], { username: 'joebloggs' } as User)

    expect(put).toHaveBeenCalledWith(
      {
        path: '/licence/id/1/submit',
        data: [],
      },
      { username: 'joebloggs' },
    )
  })

  describe('Match Licences', () => {
    it('Should pass parameters to sort the matched licences', async () => {
      post.mockResolvedValue([{ licenceId: 1, prisonCode: 'MDI' } as LicenceSummary])

      const result = await licenceApiClient.matchLicences(
        [LicenceStatus.IN_PROGRESS],
        ['MDI'],
        [1],
        ['ABC1234'],
        [],
        'conditionalReleaseDate',
        'DESC',
        { username: 'joebloggs' } as User,
      )

      expect(post).toHaveBeenCalledWith(
        {
          path: '/licence/match',
          data: {
            prison: ['MDI'],
            status: [LicenceStatus.IN_PROGRESS],
            staffId: [1],
            nomsId: ['ABC1234'],
            pdu: [],
          },
          query: {
            sortBy: 'conditionalReleaseDate',
            sortOrder: 'DESC',
          },
        },
        { username: 'joebloggs' },
      )
      expect(result).toEqual([{ licenceId: 1, prisonCode: 'MDI' }])
    })

    it('Should call the endpoint without the sort query params', async () => {
      post.mockResolvedValue([{ licenceId: 1, prisonCode: 'MDI' } as LicenceSummary])

      const result = await licenceApiClient.matchLicences(
        [LicenceStatus.IN_PROGRESS],
        ['MDI'],
        [1],
        ['ABC1234'],
        [],
        null,
        null,
        { username: 'joebloggs' } as User,
      )

      expect(post).toHaveBeenCalledWith(
        {
          path: '/licence/match',
          data: {
            prison: ['MDI'],
            status: [LicenceStatus.IN_PROGRESS],
            staffId: [1],
            nomsId: ['ABC1234'],
            pdu: [],
          },
          query: {},
        },
        { username: 'joebloggs' },
      )
      expect(result).toEqual([{ licenceId: 1, prisonCode: 'MDI' }])
    })
  })

  it('Search prisoners by nomis ids', async () => {
    await licenceApiClient.searchPrisonersByNomsIds(['A1234AA'], { username: 'joebloggs' } as User)
    expect(post).toHaveBeenCalledWith(
      {
        path: '/prisoner-search/prisoner-numbers',
        data: {
          prisonerNumbers: ['A1234AA'],
        },
      },
      { username: 'joebloggs' },
    )
  })

  it('Search prisoners by nomis ids is not called with no prison numbers', async () => {
    await licenceApiClient.searchPrisonersByNomsIds([], { username: 'joebloggs' } as User)
    expect(post).not.toHaveBeenCalled()
  })

  it('Search prisoners by release date', async () => {
    await licenceApiClient.searchPrisonersByReleaseDate(
      parseCvlDate('01/02/2024'),
      parseCvlDate('02/03/2025'),
      ['MDI'],
      1,
      {
        username: 'joebloggs',
      } as User,
    )
    expect(post).toHaveBeenCalledWith(
      {
        path: '/release-date-by-prison',
        query: { page: 1 },
        data: {
          earliestReleaseDate: '2024-02-01',
          latestReleaseDate: '2025-03-02',
          prisonIds: ['MDI'],
        },
      },
      { username: 'joebloggs' },
    )
  })
  it('Search prisoners by release date is not called with no prison ids', async () => {
    await licenceApiClient.searchPrisonersByReleaseDate(parseCvlDate('01/02/2024'), parseCvlDate('02/03/2025'), [], 1, {
      username: 'joebloggs',
    } as User)
    expect(post).not.toHaveBeenCalled()
  })

  it('should update responsible COM for an offender', async () => {
    await licenceApiClient.updateResponsibleCom('X1234', {
      staffIdentifier: 2000,
      staffUsername: 'joebloggs',
      staffEmail: 'joebloggs@probation.gov.uk',
    } as UpdateComRequest)

    expect(put).toHaveBeenCalledWith({
      path: '/offender/crn/X1234/responsible-com',
      data: {
        staffIdentifier: 2000,
        staffUsername: 'joebloggs',
        staffEmail: 'joebloggs@probation.gov.uk',
      },
    })
  })

  it('should update probation team for an offender', async () => {
    await licenceApiClient.updateProbationTeam('X1234', {
      probationAreaCode: 'N02',
      probationAreaDescription: 'N02 Region',
      probationPduCode: 'PDU2',
      probationPduDescription: 'PDU2 Description',
      probationLauCode: 'LAU2',
      probationLauDescription: 'LAU2 Description',
      probationTeamCode: 'Team2',
      probationTeamDescription: 'Team2 Description',
    } as UpdateProbationTeamRequest)

    expect(put).toHaveBeenCalledWith({
      path: '/offender/crn/X1234/probation-team',
      data: {
        probationAreaCode: 'N02',
        probationAreaDescription: 'N02 Region',
        probationPduCode: 'PDU2',
        probationPduDescription: 'PDU2 Description',
        probationLauCode: 'LAU2',
        probationLauDescription: 'LAU2 Description',
        probationTeamCode: 'Team2',
        probationTeamDescription: 'Team2 Description',
      },
    })
  })

  it('should update COM details', async () => {
    await licenceApiClient.updateComDetails({
      staffIdentifier: 2000,
      staffUsername: 'joebloggs',
      staffEmail: 'joebloggs@probation.gov.uk',
    } as UpdateComRequest)

    expect(put).toHaveBeenCalledWith({
      path: '/com/update',
      data: {
        staffIdentifier: 2000,
        staffUsername: 'joebloggs',
        staffEmail: 'joebloggs@probation.gov.uk',
      },
    })
  })

  it('should update Prison User details', async () => {
    await licenceApiClient.updatePrisonUserDetails({
      staffUsername: 'joebloggs',
      staffEmail: 'joebloggs@probation.gov.uk',
    } as UpdatePrisonUserRequest)

    expect(put).toHaveBeenCalledWith({
      path: '/prison-user/update',
      data: {
        staffUsername: 'joebloggs',
        staffEmail: 'joebloggs@probation.gov.uk',
      },
    })
  })

  it('should edit a licence', async () => {
    post.mockResolvedValue({ id: 1, prisonCode: 'MDI' } as Licence)

    const result = await licenceApiClient.editLicence('1', { username: 'joebloggs' } as User)

    expect(post).toHaveBeenCalledWith({ path: '/licence/id/1/edit' }, { username: 'joebloggs' })
    expect(result).toEqual({ id: 1, prisonCode: 'MDI' })
  })

  it('Create variation', async () => {
    post.mockResolvedValue({ licenceId: 1, prisonCode: 'MDI' } as LicenceSummary)

    const result = await licenceApiClient.createVariation('1', { username: 'joebloggs' } as User)

    expect(post).toHaveBeenCalledWith({ path: '/licence/id/1/create-variation' }, { username: 'joebloggs' })
    expect(result).toEqual({ licenceId: 1, prisonCode: 'MDI' })
  })

  it('Activate variation', async () => {
    await licenceApiClient.activateVariation(1, { username: 'joebloggs' } as User)

    expect(put).toHaveBeenCalledWith({ path: '/licence/id/1/activate-variation' }, { username: 'joebloggs' })
  })

  it('Update spo discussion', async () => {
    await licenceApiClient.updateSpoDiscussion(
      '1',
      { spoDiscussion: 'Yes' } as UpdateSpoDiscussionRequest,
      { username: 'joebloggs' } as User,
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/spo-discussion', data: { spoDiscussion: 'Yes' } },
      { username: 'joebloggs' },
    )
  })

  it('Update vlo discussion', async () => {
    await licenceApiClient.updateVloDiscussion(
      '1',
      { vloDiscussion: 'Yes' } as UpdateVloDiscussionRequest,
      { username: 'joebloggs' } as User,
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/vlo-discussion', data: { vloDiscussion: 'Yes' } },
      { username: 'joebloggs' },
    )
  })

  it('Update reason for variation', async () => {
    await licenceApiClient.updateReasonForVariation(
      '1',
      { reasonForVariation: 'Reason' } as UpdateReasonForVariationRequest,
      { username: 'joebloggs' } as User,
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/reason-for-variation', data: { reasonForVariation: 'Reason' } },
      { username: 'joebloggs' },
    )
  })

  it('Discard licence', async () => {
    await licenceApiClient.discard('1', { username: 'joebloggs' } as User)

    expect(del).toHaveBeenCalledWith({ path: '/licence/id/1/discard' }, { username: 'joebloggs' })
  })

  it('Update prison information', async () => {
    await licenceApiClient.updatePrisonInformation(
      '1',
      {
        prisonCode: 'PVI',
        prisonDescription: 'Pentonville (HMP)',
        prisonTelephone: '+44 276 54545',
      } as UpdatePrisonInformationRequest,
      { username: 'joebloggs' } as User,
    )

    expect(put).toHaveBeenCalledWith(
      {
        path: '/licence/id/1/prison-information',
        data: {
          prisonCode: 'PVI',
          prisonDescription: 'Pentonville (HMP)',
          prisonTelephone: '+44 276 54545',
        },
      },
      { username: 'joebloggs' },
    )
  })

  it('Update sentence dates', async () => {
    await licenceApiClient.updateSentenceDates('1', { username: 'joebloggs' } as User)

    expect(put).toHaveBeenCalledWith(
      {
        path: '/licence/id/1/sentence-dates',
      },
      { username: 'joebloggs' },
    )
  })

  it('Approve a licence variation', async () => {
    await licenceApiClient.approveVariation('1', { username: 'joebloggs' } as User)
    expect(put).toHaveBeenCalledWith({ path: '/licence/id/1/approve-variation' }, { username: 'joebloggs' })
  })

  it('Refer a licence variation', async () => {
    await licenceApiClient.referVariation(
      '1',
      { reasonForReferral: 'reason' } as ReferVariationRequest,
      { username: 'joebloggs' } as User,
    )
    expect(put).toHaveBeenCalledWith(
      {
        path: '/licence/id/1/refer-variation',
        data: { reasonForReferral: 'reason' },
      },
      { username: 'joebloggs' },
    )
  })

  it('Override licence status code', async () => {
    const username = 'admin-user'
    await licenceApiClient.overrideStatusCode(1, { reason: 'Test Reason', statusCode: LicenceStatus.APPROVED }, {
      username,
    } as User)
    expect(post).toHaveBeenCalledWith(
      {
        path: `/licence/id/1/override/status`,
        data: { reason: 'Test Reason', statusCode: LicenceStatus.APPROVED },
      },
      { username },
    )
  })

  it('Override licence dates', async () => {
    const username = 'admin-user'
    const dates = {
      conditionalReleaseDate: '01/01/2022',
      actualReleaseDate: '02/01/2022',
      sentenceStartDate: '03/01/2022',
      sentenceEndDate: '04/01/2022',
      licenceStartDate: '28/09/2021',
      licenceExpiryDate: '05/01/2022',
      topupSupervisionStartDate: '06/01/2022',
      topupSupervisionExpiryDate: '07/01/2022',
    }

    await licenceApiClient.overrideLicenceDates(1, { ...dates, reason: 'Test Reason' }, {
      username,
    } as User)
    expect(put).toHaveBeenCalledWith(
      {
        path: `/licence/id/1/override/dates`,
        data: { ...dates, reason: 'Test Reason' },
      },
      { username },
    )
  })

  it('Override licence prisoner details', async () => {
    const username = 'admin-user'
    const details: OverrideLicencePrisonerDetailsRequest = {
      forename: 'foo',
      middleNames: 'fizz',
      surname: 'bar',
      dateOfBirth: '01/01/1995',
      reason: 'test',
    }

    await licenceApiClient.overrideLicencePrisonerDetails(1, details, { username } as User)

    expect(post).toHaveBeenCalledWith(
      {
        path: `/licence/id/1/override/prisoner-details`,
        data: details,
      },
      { username },
    )
  })

  it('Override licence type', async () => {
    const username = 'admin-user'
    await licenceApiClient.overrideLicenceType(1, { licenceType: 'AP', reason: 'Test Reason' }, {
      username,
    } as User)
    expect(post).toHaveBeenCalledWith(
      {
        path: `/licence/id/1/override/type`,
        data: { licenceType: 'AP', reason: 'Test Reason' },
        returnBodyOnErrorIfPredicate: expect.any(Function),
      },
      { username },
    )
  })

  it('should call to set a licence as reviewed', async () => {
    const username = 'admin-user'
    await licenceApiClient.reviewWithoutVariation(1, {
      username,
    } as User)
    expect(post).toHaveBeenCalledWith(
      {
        path: `/licence/id/1/review-with-no-variation-required`,
      },
      { username },
    )
  })

  it('should get prisoner details', async () => {
    const username = 'admin-user'
    await licenceApiClient.getPrisonerDetail('G4169UO', { username } as User)
    expect(get).toHaveBeenCalledWith({ path: '/prisoner-search/nomisid/G4169UO' }, { username })
  })

  describe('Exclusion zone file', () => {
    it('Upload an exclusion zone PDF file', async () => {
      const myUpload = { path: 'test-file' } as Express.Multer.File
      await licenceApiClient.uploadExclusionZoneFile('1', '1', { username: 'joebloggs' } as User, myUpload)
      expect(postMultiPart).toHaveBeenCalledWith(
        { path: '/exclusion-zone/id/1/condition/id/1/file-upload', fileToUpload: myUpload },
        { username: 'joebloggs' },
      )
    })

    it('Get the exclusion zone image as a stream', async () => {
      stream.mockResolvedValue(Readable.from('image'))
      const result = await licenceApiClient.getExclusionZoneImage('1', '1', { username: 'joebloggs' } as User)
      expect(stream).toHaveBeenCalledWith(
        { path: '/exclusion-zone/id/1/condition/id/1/full-size-image' },
        { username: 'joebloggs' },
      )
      expect(result.read()).toEqual('image')
    })

    it('Get the exclusion zone image as JPEG data', async () => {
      get.mockResolvedValue(Buffer.from('image'))
      const result = await licenceApiClient.getExclusionZoneImageData('1', '1', { username: 'joebloggs' } as User)
      expect(get).toHaveBeenCalledWith(
        { path: '/exclusion-zone/id/1/condition/id/1/full-size-image', responseType: 'image/jpeg' },
        { username: 'joebloggs' },
      )
      expect(result.toString()).toEqual('image')
    })
  })

  describe('Audit events', () => {
    const anEvent = {
      licenceId: 1,
      eventTime: '20/01/2022 14:56:13',
      username: 'USER',
      fullName: 'Test User',
      eventType: 'USER_EVENT',
      summary: 'Summary',
      detail: 'Detail',
    } as AuditEvent

    const aRequest = {
      licenceId: 1,
      username: 'USER',
      startTime: '20/01/2022 14:56:13',
      endTime: '20/02/2022 14:56:13',
    } as AuditRequest

    it('Record an audit event', async () => {
      await licenceApiClient.recordAuditEvent(anEvent, { username: 'USER' } as User)
      expect(put).toHaveBeenCalledWith({ path: '/audit/save', data: anEvent }, { username: 'USER' })
    })

    it('Get audit events for a user and licence', async () => {
      await licenceApiClient.getAuditEvents(aRequest, { username: 'USER' } as User)
      expect(post).toHaveBeenCalledWith({ path: '/audit/retrieve', data: aRequest }, { username: 'USER' })
    })
  })

  describe('Licence events', () => {
    it('Match licence events licence', async () => {
      await licenceApiClient.matchLicenceEvents('1', [], undefined, undefined, { username: 'USER' } as User)
      expect(get).toHaveBeenCalledWith(
        {
          path: '/events/match',
          query: {
            licenceId: '1',
            eventType: [],
            sortBy: undefined,
            sortOrder: undefined,
          },
        },
        { username: 'USER' },
      )
    })

    it('Match licence events by licence and list of event types', async () => {
      const eventTypes = [
        LicenceEventType.VARIATION_SUBMITTED_REASON.valueOf(),
        LicenceEventType.VARIATION_REFERRED.valueOf(),
      ]
      await licenceApiClient.matchLicenceEvents('1', eventTypes, 'eventTime', 'DESC', { username: 'USER' } as User)
      expect(get).toHaveBeenCalledWith(
        {
          path: '/events/match',
          query: {
            licenceId: '1',
            eventType: eventTypes,
            sortBy: 'eventTime',
            sortOrder: 'DESC',
          },
        },
        { username: 'USER' },
      )
    })
  })

  describe('Com review count: ', () => {
    it('Should get mycount and teams individual count for Com', async () => {
      await licenceApiClient.getComReviewCount({ username: 'joebloggs', deliusStaffIdentifier: 2000 } as User)
      expect(get).toHaveBeenCalledWith(
        {
          path: `/com/2000/review-counts`,
        },
        { username: 'joebloggs' },
      )
    })

    describe('getOmuEmail', () => {
      it('should log an error if the result code is an error', async () => {
        get.mockRejectedValue('error')
        await licenceApiClient.getOmuEmail('ABC', { username: 'joebloggs' } as User)

        expect(logger.error).toHaveBeenCalledWith('Error when fetching OMU email for prisonId: ABC')
      })
    })
  })

  describe('Approver caseloads: ', () => {
    it('Should get licences for approval', async () => {
      await licenceApiClient.getApprovalCaseload(['PRI'], { username: 'joebloggs' } as User)
      expect(post).toHaveBeenCalledWith(
        {
          path: '/caseload/prison-approver/approval-needed',
          data: ['PRI'],
        },
        { username: 'joebloggs' },
      )
    })

    it('Should get licences that have recently been approved', async () => {
      await licenceApiClient.getRecentlyApprovedCaseload(['PRI'], { username: 'joebloggs' } as User)
      expect(post).toHaveBeenCalledWith(
        {
          path: '/caseload/prison-approver/recently-approved',
          data: ['PRI'],
        },
        { username: 'joebloggs' },
      )
    })
  })

  describe('Ca caseloads: ', () => {
    const data = { prisonCodes: ['PRI'], searchString: '' } as CaCaseloadSearch
    it('Should get licences for prison view', async () => {
      await licenceApiClient.getPrisonOmuCaseload(data, { username: 'joebloggs' } as User)
      expect(post).toHaveBeenCalledWith({ path: '/caseload/case-admin/prison-view', data }, { username: 'joebloggs' })
    })

    it('Should get licences for probation view', async () => {
      await licenceApiClient.getProbationOmuCaseload(data, { username: 'joebloggs' } as User)
      expect(post).toHaveBeenCalledWith(
        { path: '/caseload/case-admin/probation-view', data },
        { username: 'joebloggs' },
      )
    })
  })

  describe('Ineligibility Reasons: ', () => {
    it('should get ineligibility reasons', async () => {
      await licenceApiClient.getIneligibilityReasons('A1234AA')
      expect(get).toHaveBeenCalledWith({ path: '/offender/nomisid/A1234AA/ineligibility-reasons' })
    })
  })

  describe('IS-91 status: ', () => {
    it('should get IS-91 status', async () => {
      await licenceApiClient.getIS91Status('A1234AA')
      expect(get).toHaveBeenCalledWith({ path: '/offender/nomisid/A1234AA/is-91-status' })
    })
  })

  describe('Electronic Monitoring Programme: ', () => {
    it('should update Electronic Monitoring Programme', async () => {
      const request: UpdateElectronicMonitoringProgrammeRequest = {
        isToBeTaggedForProgramme: true,
        programmeName: 'EM Programme',
      }
      await licenceApiClient.updateElectronicMonitoringProgramme(1, request)
      expect(post).toHaveBeenCalledWith({ path: '/licence/id/1/electronic-monitoring-programmes', data: request })
    })
  })

  describe('searchForAddresses', () => {
    it('should search for addresses', async () => {
      const request = { searchQuery: '123 Fake Street' }
      await licenceApiClient.searchForAddresses(request, { username: 'joebloggs' } as User)
      expect(get).toHaveBeenCalledWith({ path: '/address/search/by/text/123 Fake Street' }, { username: 'joebloggs' })
    })
  })
})
