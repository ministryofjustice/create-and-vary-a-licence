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
  CreateLicenceRequest,
  Licence,
  LicenceSummary,
  ReferVariationRequest,
  StatusUpdateRequest,
  UpdateAdditionalConditionDataRequest,
  UpdateComRequest,
  UpdatePrisonInformationRequest,
  UpdateReasonForVariationRequest,
  UpdateSentenceDatesRequest,
  UpdateSpoDiscussionRequest,
  UpdateVloDiscussionRequest,
} from '../@types/licenceApiClientTypes'
import HmppsRestClient from './hmppsRestClient'
import LicenceStatus from '../enumeration/licenceStatus'
import { User } from '../@types/CvlUserDetails'

jest.mock('./tokenStore', () => {
  return jest.fn().mockImplementation(() => {
    return { TokenStore: () => '', getAuthToken: () => '' }
  })
})

const licenceApiClient = new LicenceApiClient()

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
    post.mockResolvedValue({ licenceId: 1, prisonCode: 'MDI' } as LicenceSummary)

    const result = await licenceApiClient.createLicence({} as CreateLicenceRequest, { username: 'joebloggs' } as User)

    expect(post).toHaveBeenCalledWith({ path: '/licence/create', data: {} }, { username: 'joebloggs' })
    expect(result).toEqual({ licenceId: 1, prisonCode: 'MDI' })
  })

  it('Get licence by Id', async () => {
    get.mockResolvedValue({ id: 1, prisonCode: 'MDI' } as Licence)

    const result = await licenceApiClient.getLicenceById('1', { username: 'joebloggs' } as User)

    expect(get).toHaveBeenCalledWith({ path: '/licence/id/1' }, { username: 'joebloggs' })
    expect(result).toEqual({ id: 1, prisonCode: 'MDI' })
  })

  it('Update appointment person', async () => {
    await licenceApiClient.updateAppointmentPerson(
      '1',
      { appointmentPerson: 'Joe Bloggs' } as AppointmentPersonRequest,
      { username: 'joebloggs' } as User
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/appointmentPerson', data: { appointmentPerson: 'Joe Bloggs' } },
      { username: 'joebloggs' }
    )
  })

  it('Update appointment time', async () => {
    await licenceApiClient.updateAppointmentTime(
      '1',
      { appointmentTime: '12:30pm' } as AppointmentTimeRequest,
      { username: 'joebloggs' } as User
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/appointmentTime', data: { appointmentTime: '12:30pm' } },
      { username: 'joebloggs' }
    )
  })

  it('Update appointment address', async () => {
    await licenceApiClient.updateAppointmentAddress(
      '1',
      { appointmentAddress: '123 Fake Street' } as AppointmentAddressRequest,
      { username: 'joebloggs' } as User
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/appointment-address', data: { appointmentAddress: '123 Fake Street' } },
      { username: 'joebloggs' }
    )
  })

  it('Update contact number', async () => {
    await licenceApiClient.updateContactNumber(
      '1',
      { telephone: '0112877368' } as ContactNumberRequest,
      { username: 'joebloggs' } as User
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/contact-number', data: { telephone: '0112877368' } },
      { username: 'joebloggs' }
    )
  })

  it('Update bespoke conditions', async () => {
    await licenceApiClient.updateBespokeConditions(
      '1',
      { conditions: ['Not to enter any shopping centres'] } as BespokeConditionsRequest,
      { username: 'joebloggs' } as User
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/bespoke-conditions', data: { conditions: ['Not to enter any shopping centres'] } },
      { username: 'joebloggs' }
    )
  })

  it('Update additional conditions', async () => {
    await licenceApiClient.updateAdditionalConditions(
      '1',
      { additionalConditions: [{ code: 'condition1' }] } as AdditionalConditionsRequest,
      { username: 'joebloggs' } as User
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/additional-conditions', data: { additionalConditions: [{ code: 'condition1' }] } },
      { username: 'joebloggs' }
    )
  })

  it('Update additional condition data', async () => {
    await licenceApiClient.updateAdditionalConditionData(
      '1',
      '2',
      { data: [{ value: 'condition1' }] } as UpdateAdditionalConditionDataRequest,
      { username: 'joebloggs' } as User
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/additional-conditions/condition/2', data: { data: [{ value: 'condition1' }] } },
      { username: 'joebloggs' }
    )
  })

  it('Update licence status', async () => {
    await licenceApiClient.updateLicenceStatus(
      '1',
      { status: 'IN_PROGRESS' } as StatusUpdateRequest,
      { username: 'joebloggs' } as User
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/status', data: { status: 'IN_PROGRESS' } },
      { username: 'joebloggs' }
    )
  })

  it('Submit licence', async () => {
    await licenceApiClient.submitLicence('1', { username: 'joebloggs' } as User)

    expect(put).toHaveBeenCalledWith(
      {
        path: '/licence/id/1/submit',
      },
      { username: 'joebloggs' }
    )
  })

  describe('Match Licences', () => {
    it('Should pass parameters to sort the matched licences', async () => {
      get.mockResolvedValue([{ licenceId: 1, prisonCode: 'MDI' } as LicenceSummary])

      const result = await licenceApiClient.matchLicences(
        [LicenceStatus.IN_PROGRESS],
        ['MDI'],
        [1],
        ['ABC1234'],
        [],
        'conditionalReleaseDate',
        'DESC',
        { username: 'joebloggs' } as User
      )

      expect(get).toHaveBeenCalledWith(
        {
          path: '/licence/match',
          query: {
            prison: ['MDI'],
            status: [LicenceStatus.IN_PROGRESS],
            staffId: [1],
            nomsId: ['ABC1234'],
            pdu: [],
            sortBy: 'conditionalReleaseDate',
            sortOrder: 'DESC',
          },
        },
        { username: 'joebloggs' }
      )
      expect(result).toEqual([{ licenceId: 1, prisonCode: 'MDI' }])
    })

    it('Should call the endpoint without the sort query params', async () => {
      get.mockResolvedValue([{ licenceId: 1, prisonCode: 'MDI' } as LicenceSummary])

      const result = await licenceApiClient.matchLicences(
        [LicenceStatus.IN_PROGRESS],
        ['MDI'],
        [1],
        ['ABC1234'],
        [],
        null,
        null,
        { username: 'joebloggs' } as User
      )

      expect(get).toHaveBeenCalledWith(
        {
          path: '/licence/match',
          query: {
            prison: ['MDI'],
            status: [LicenceStatus.IN_PROGRESS],
            staffId: [1],
            nomsId: ['ABC1234'],
            pdu: [],
          },
        },
        { username: 'joebloggs' }
      )
      expect(result).toEqual([{ licenceId: 1, prisonCode: 'MDI' }])
    })
  })

  it('Batch activate licences', async () => {
    await licenceApiClient.batchActivateLicences([123, 321])
    expect(post).toHaveBeenCalledWith({ path: '/licence/activate-licences', data: [123, 321] })
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

  it('Create variation', async () => {
    post.mockResolvedValue({ licenceId: 1, prisonCode: 'MDI' } as LicenceSummary)

    const result = await licenceApiClient.createVariation('1', { username: 'joebloggs' } as User)

    expect(post).toHaveBeenCalledWith({ path: '/licence/id/1/create-variation' }, { username: 'joebloggs' })
    expect(result).toEqual({ licenceId: 1, prisonCode: 'MDI' })
  })

  it('Update spo discussion', async () => {
    await licenceApiClient.updateSpoDiscussion(
      '1',
      { spoDiscussion: 'Yes' } as UpdateSpoDiscussionRequest,
      { username: 'joebloggs' } as User
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/spo-discussion', data: { spoDiscussion: 'Yes' } },
      { username: 'joebloggs' }
    )
  })

  it('Update vlo discussion', async () => {
    await licenceApiClient.updateVloDiscussion(
      '1',
      { vloDiscussion: 'Yes' } as UpdateVloDiscussionRequest,
      { username: 'joebloggs' } as User
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/vlo-discussion', data: { vloDiscussion: 'Yes' } },
      { username: 'joebloggs' }
    )
  })

  it('Update reason for variation', async () => {
    await licenceApiClient.updateReasonForVariation(
      '1',
      { reasonForVariation: 'Reason' } as UpdateReasonForVariationRequest,
      { username: 'joebloggs' } as User
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/reason-for-variation', data: { reasonForVariation: 'Reason' } },
      { username: 'joebloggs' }
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
      { username: 'joebloggs' } as User
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
      { username: 'joebloggs' }
    )
  })

  it('Update sentence dates', async () => {
    await licenceApiClient.updateSentenceDates(
      '1',
      {
        conditionalReleaseDate: '09/09/2022',
        actualReleaseDate: '09/09/2022',
        sentenceStartDate: '09/09/2021',
        sentenceEndDate: '09/09/2023',
        licenceStartDate: '09/09/2022',
        licenceExpiryDate: '09/09/2023',
        topupSupervisionStartDate: '09/09/2023',
        topupSupervisionExpiryDate: '09/09/2024',
      } as UpdateSentenceDatesRequest,
      { username: 'joebloggs' } as User
    )

    expect(put).toHaveBeenCalledWith(
      {
        path: '/licence/id/1/sentence-dates',
        data: {
          conditionalReleaseDate: '09/09/2022',
          actualReleaseDate: '09/09/2022',
          sentenceStartDate: '09/09/2021',
          sentenceEndDate: '09/09/2023',
          licenceStartDate: '09/09/2022',
          licenceExpiryDate: '09/09/2023',
          topupSupervisionStartDate: '09/09/2023',
          topupSupervisionExpiryDate: '09/09/2024',
        },
      },
      { username: 'joebloggs' }
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
      { username: 'joebloggs' } as User
    )
    expect(put).toHaveBeenCalledWith(
      {
        path: '/licence/id/1/refer-variation',
        data: { reasonForReferral: 'reason' },
      },
      { username: 'joebloggs' }
    )
  })

  describe('Exclusion zone file', () => {
    it('Upload an exclusion zone PDF file', async () => {
      const myUpload = { path: 'test-file' } as Express.Multer.File
      await licenceApiClient.uploadExclusionZoneFile('1', '1', { username: 'joebloggs' } as User, myUpload)
      expect(postMultiPart).toHaveBeenCalledWith(
        { path: '/exclusion-zone/id/1/condition/id/1/file-upload', fileToUpload: myUpload },
        { username: 'joebloggs' }
      )
    })

    it('Remove a previously uploaded exclusion zone PDF file', async () => {
      await licenceApiClient.removeExclusionZoneFile('1', '1', { username: 'joebloggs' } as User)
      expect(put).toHaveBeenCalledWith(
        { path: `/exclusion-zone/id/1/condition/id/1/remove-upload` },
        { username: 'joebloggs' }
      )
    })

    it('Get the exclusion zone image as a stream', async () => {
      stream.mockResolvedValue(Readable.from('image'))
      const result = await licenceApiClient.getExclusionZoneImage('1', '1', { username: 'joebloggs' } as User)
      expect(stream).toHaveBeenCalledWith(
        { path: '/exclusion-zone/id/1/condition/id/1/full-size-image' },
        { username: 'joebloggs' }
      )
      expect(result.read()).toEqual('image')
    })

    it('Get the exclusion zone image as JPEG data', async () => {
      get.mockResolvedValue(Buffer.from('image'))
      const result = await licenceApiClient.getExclusionZoneImageData('1', '1', { username: 'joebloggs' } as User)
      expect(get).toHaveBeenCalledWith(
        { path: '/exclusion-zone/id/1/condition/id/1/full-size-image', responseType: 'image/jpeg' },
        { username: 'joebloggs' }
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
})
