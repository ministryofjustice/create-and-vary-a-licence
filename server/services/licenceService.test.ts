import { Readable } from 'stream'
import { format, parse } from 'date-fns'
import { User } from '../@types/CvlUserDetails'
import LicenceApiClient from '../data/licenceApiClient'
import LicenceService from './licenceService'
import * as utils from '../utils/utils'
import * as licenceComparator from '../utils/licenceComparator'
import DateTime from '../routes/initialAppointment/types/dateTime'
import Address from '../routes/initialAppointment/types/address'
import LicenceType from '../enumeration/licenceType'
import AdditionalConditions from '../routes/manageConditions/types/additionalConditions'
import SimpleDate from '../routes/creatingLicences/types/date'
import BespokeConditions from '../routes/manageConditions/types/bespokeConditions'
import LicenceStatus from '../enumeration/licenceStatus'
import {
  AdditionalCondition,
  EmailContact,
  Licence,
  LicenceSummary,
  StandardCondition,
  UpdateComRequest,
  UpdatePrisonCaseAdminRequest,
  UpdatePrisonInformationRequest,
  UpdateProbationTeamRequest,
  UpdateSentenceDatesRequest,
} from '../@types/licenceApiClientTypes'
import { VariedConditions } from '../utils/licenceComparator'
import LicenceEventType from '../enumeration/licenceEventType'
import TimelineEvent from '../@types/TimelineEvent'
import ConditionService from './conditionService'
import { AdditionalConditionsConfig } from '../@types/LicencePolicy'

jest.mock('../data/licenceApiClient')
jest.mock('./conditionService')
jest.spyOn(utils, 'convertDateFormat').mockImplementation((value: string) => value)

describe('Licence Service', () => {
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const conditionService = new ConditionService(licenceApiClient) as jest.Mocked<ConditionService>
  const licenceService = new LicenceService(licenceApiClient, conditionService)

  conditionService.getStandardConditions.mockResolvedValue({} as StandardCondition[])
  conditionService.getAdditionalConditions.mockResolvedValue({} as AdditionalConditionsConfig)

  conditionService.getStandardConditions.mockResolvedValue([{ text: 'fake standard condition', code: 'fake1' }])

  const user = {
    username: 'joebloggs',
    displayName: 'Joe Bloggs',
    deliusStaffIdentifier: 2000,
    firstName: 'Joe',
    lastName: 'Bloggs',
    emailAddress: 'jbloggs@probation.gov.uk',
  } as User

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Create Licence', () => {
    it('Should create a licence in the backend API', async () => {
      await licenceService.createLicence({ nomsId: 'ABC1234', type: 'CRD' }, user)
      expect(licenceApiClient.createLicence).toHaveBeenCalledWith({ nomsId: 'ABC1234', type: 'CRD' }, user)
    })
  })

  it('Get Licence', async () => {
    await licenceService.getLicence(1, user)
    expect(licenceApiClient.getLicenceById).toBeCalledWith(1, user)
  })

  it('Update appointment person', async () => {
    await licenceService.updateAppointmentPerson(
      '1',
      {
        contactName: 'Joe Bloggs',
        appointmentPersonType: 'SPECIFIC_PERSON',
      },
      user
    )
    expect(licenceApiClient.updateAppointmentPerson).toBeCalledWith(
      '1',
      { appointmentPerson: 'Joe Bloggs', appointmentPersonType: 'SPECIFIC_PERSON' },
      user
    )
  })

  it('Update appointment time when appointment time type is SPECIFIC_DATE_TIME', async () => {
    const timeConverter = jest.spyOn(DateTime, 'toJson').mockReturnValue('22/12/2022 12:20')
    await licenceService.updateAppointmentTime(
      '1',
      {
        date: { calendarDate: '22/12/2022' },
        time: { hour: '12', minute: '20', ampm: 'pm' },
        appointmentTimeType: 'SPECIFIC_DATE_TIME',
      } as DateTime,
      user
    )
    expect(licenceApiClient.updateAppointmentTime).toBeCalledWith(
      '1',
      { appointmentTime: '22/12/2022 12:20', appointmentTimeType: 'SPECIFIC_DATE_TIME' },
      user
    )
    expect(timeConverter).toBeCalledWith({
      date: { calendarDate: '22/12/2022' },
      time: { hour: '12', minute: '20', ampm: 'pm' },
      appointmentTimeType: 'SPECIFIC_DATE_TIME',
    } as DateTime)
  })

  it('Update appointment time when appointment time type is IMMEDIATE_UPON_RELEASE', async () => {
    const timeConverter = jest.spyOn(DateTime, 'toJson').mockReturnValue('22/12/2022 12:20')
    await licenceService.updateAppointmentTime(
      '1',
      {
        date: null,
        time: null,
        appointmentTimeType: 'IMMEDIATE_UPON_RELEASE',
      } as DateTime,
      user
    )
    expect(licenceApiClient.updateAppointmentTime).toBeCalledWith(
      '1',
      { appointmentTime: null, appointmentTimeType: 'IMMEDIATE_UPON_RELEASE' },
      user
    )
    expect(timeConverter).not.toHaveBeenCalled()
  })

  it('Update appointment address', async () => {
    const addressConverter = jest.spyOn(utils, 'addressObjectToString').mockReturnValue('123 Fake Street, Fakestown')
    await licenceService.updateAppointmentAddress(
      '1',
      {
        addressLine1: '123 Fake Street',
        addressTown: 'Fakestown',
      } as Address,
      user
    )
    expect(licenceApiClient.updateAppointmentAddress).toBeCalledWith(
      '1',
      { appointmentAddress: '123 Fake Street, Fakestown' },
      user
    )
    expect(addressConverter).toBeCalledWith({
      addressLine1: '123 Fake Street',
      addressTown: 'Fakestown',
    } as Address)
  })

  it('Update contact number', async () => {
    await licenceService.updateContactNumber('1', { telephone: '07624726976' }, user)
    expect(licenceApiClient.updateContactNumber).toBeCalledWith('1', { telephone: '07624726976' }, user)
  })

  describe('Update additional conditions', () => {
    it('should handle undefined list of additional conditions', async () => {
      await licenceService.updateAdditionalConditions(1, LicenceType.AP, {} as AdditionalConditions, user, 'version')
      expect(licenceApiClient.updateAdditionalConditions).toBeCalledWith(
        1,
        { additionalConditions: [], conditionType: 'AP' },
        user
      )
    })

    it('should build list of conditions correctly with index numbers and short category name if it exists', async () => {
      conditionService.getAdditionalConditionByCode
        .mockResolvedValueOnce({
          categoryShort: 'Short category name',
          category: 'Longer category name',
          text: 'Condition 1',
          code: 'CON1,',
          requiresInput: false,
        })
        .mockResolvedValueOnce({
          category: 'Longer category name',
          text: 'Condition 2',
          code: 'CON2',
          requiresInput: false,
        })

      await licenceService.updateAdditionalConditions(
        1,
        LicenceType.AP,
        { additionalConditions: ['code1', 'code2'] },
        user,
        'version'
      )
      expect(licenceApiClient.updateAdditionalConditions).toBeCalledWith(
        1,
        {
          additionalConditions: [
            {
              code: 'code1',
              sequence: 0,
              category: 'Short category name',
              text: 'Condition 1',
            },
            {
              code: 'code2',
              sequence: 1,
              category: 'Longer category name',
              text: 'Condition 2',
            },
          ],
          conditionType: 'AP',
        },
        user
      )
      expect(conditionService.getAdditionalConditionByCode).toBeCalledTimes(2)
      expect(conditionService.getAdditionalConditionByCode).toHaveBeenNthCalledWith(1, 'code1', 'version')
      expect(conditionService.getAdditionalConditionByCode).toHaveBeenNthCalledWith(2, 'code2', 'version')
    })
  })

  describe('Update additional conditions data', () => {
    licenceApiClient.getLicenceById.mockResolvedValue({
      id: 1,
      version: 'version',
    } as Licence)

    it('should handle empty form data', async () => {
      const formData = {
        key1: '',
        key2: [] as unknown[],
        key3: undefined as unknown,
      }

      await licenceService.updateAdditionalConditionData(
        '1',
        { id: 2, text: 'condition' } as AdditionalCondition,
        formData,
        user
      )
      expect(licenceApiClient.updateAdditionalConditionData).toBeCalledWith('1', '2', { data: [] }, user)
    })

    it('should map form value to a condition', async () => {
      const formData = {
        key1: 'form value 1',
        key2: 'form value 2',
        key3: ['form value 3', 'form value 4'],
      }

      await licenceService.updateAdditionalConditionData(
        '1',
        { id: 2, text: 'condition' } as AdditionalCondition,
        formData,
        user
      )
      expect(licenceApiClient.updateAdditionalConditionData).toBeCalledWith(
        '1',
        '2',
        {
          data: [
            {
              field: 'key1',
              value: 'form value 1',
              sequence: 0,
            },
            {
              field: 'key2',
              value: 'form value 2',
              sequence: 1,
            },
            {
              field: 'key3',
              value: 'form value 3',
              sequence: 2,
            },
            {
              field: 'key3',
              value: 'form value 4',
              sequence: 3,
            },
          ],
        },
        user
      )
    })

    it('should handle stringable types', async () => {
      const formData = {
        key1: new SimpleDate('22', '12', '2022'),
      }

      await licenceService.updateAdditionalConditionData(
        '1',
        { id: 2, text: 'condition' } as AdditionalCondition,
        formData,
        user
      )
      expect(licenceApiClient.updateAdditionalConditionData).toBeCalledWith(
        '1',
        '2',
        {
          data: [
            {
              field: 'key1',
              value: 'Thursday 22nd December 2022',
              sequence: 0,
            },
          ],
        },
        user
      )
    })
  })

  it('Update bespoke conditions', async () => {
    await licenceService.updateBespokeConditions(
      '1',
      { conditions: [undefined, null, '', 'condition1'] } as BespokeConditions,
      user
    )
    expect(licenceApiClient.updateBespokeConditions).toBeCalledWith('1', { conditions: ['condition1'] }, user)
  })

  describe('Update status', () => {
    it('should update status successfully with user details', async () => {
      await licenceService.updateStatus(1, LicenceStatus.APPROVED, user)
      expect(licenceApiClient.updateLicenceStatus).toBeCalledWith(
        1,
        { status: 'APPROVED', username: 'joebloggs', fullName: 'Joe Bloggs' },
        user
      )
    })

    it('should send SYSTEM as user if user is not defined', async () => {
      await licenceService.updateStatus(1, LicenceStatus.APPROVED)
      expect(licenceApiClient.updateLicenceStatus).toBeCalledWith(
        1,
        { status: 'APPROVED', username: 'SYSTEM', fullName: 'SYSTEM' },
        undefined
      )
    })
  })

  it('Submit licence', async () => {
    await licenceService.submitLicence('1', user)
    expect(licenceApiClient.submitLicence).toBeCalledWith('1', [], user)
  })

  it('Submit variation', async () => {
    await licenceService.submitVariation('1', [{ name: 'Joe Bloggs', email: 'Email' }], user)
    expect(licenceApiClient.submitLicence).toBeCalledWith('1', [{ name: 'Joe Bloggs', email: 'Email' }], user)
  })

  it('Get licences by nomis ids and statuses', async () => {
    await licenceService.getLicencesByNomisIdsAndStatus(['ABC1234'], [LicenceStatus.APPROVED], user)
    expect(licenceApiClient.matchLicences).toBeCalledWith(['APPROVED'], null, null, ['ABC1234'], null, null, null, user)
  })

  it('Get licences for approval', async () => {
    jest.spyOn(utils, 'filterCentralCaseload').mockReturnValue(['MDI'])

    await licenceService.getLicencesForApproval(user, [])
    expect(licenceApiClient.matchLicences).toBeCalledWith(
      ['SUBMITTED'],
      ['MDI'],
      null,
      null,
      null,
      'conditionalReleaseDate',
      null,
      user
    )
  })

  it('Get licences recently approved', async () => {
    jest.spyOn(utils, 'filterCentralCaseload').mockReturnValue(['MDI'])

    await licenceService.getLicencesRecentlyApproved(user, [])
    expect(licenceApiClient.getLicencesRecentlyApproved).toBeCalledWith(['MDI'], user)
  })

  it('Get licences for variation approval', async () => {
    const approver = { ...user, probationPduCodes: ['A'] }
    await licenceService.getLicencesForVariationApproval(approver)
    expect(licenceApiClient.matchLicences).toBeCalledWith(
      ['VARIATION_SUBMITTED'],
      null,
      null,
      null,
      ['A'],
      'conditionalReleaseDate',
      null,
      approver
    )
  })

  it('should get licences created within an OMU users prison', async () => {
    jest.spyOn(utils, 'filterCentralCaseload').mockReturnValue(['MDI'])
    licenceApiClient.matchLicences.mockResolvedValue([{ licenceId: 1 } as LicenceSummary])

    const result = await licenceService.getLicencesForOmu(user, [])
    expect(licenceApiClient.matchLicences).toBeCalledWith(
      [
        'ACTIVE',
        'APPROVED',
        'SUBMITTED',
        'IN_PROGRESS',
        'VARIATION_APPROVED',
        'VARIATION_IN_PROGRESS',
        'VARIATION_SUBMITTED',
      ],
      ['MDI'],
      null,
      null,
      null,
      'conditionalReleaseDate',
      null,
      user
    )
    expect(result).toEqual([{ licenceId: 1 }])
  })

  it('should update COM responsible for an offender', async () => {
    await licenceService.updateResponsibleCom('X1234', {
      staffIdentifier: 2000,
      staffUsername: 'joebloggs',
      staffEmail: 'joebloggs@probation.gov.uk',
      firstName: 'Joseph',
      lastName: 'Bloggs',
    } as UpdateComRequest)

    expect(licenceApiClient.updateResponsibleCom).toBeCalledWith('X1234', {
      staffIdentifier: 2000,
      staffUsername: 'joebloggs',
      staffEmail: 'joebloggs@probation.gov.uk',
      firstName: 'Joseph',
      lastName: 'Bloggs',
    })
  })

  it('should update prison user responsible for an offender', async () => {
    await licenceService.updatePrisonUserDetails({
      staffUsername: 'joebloggs',
      staffEmail: 'joebloggs@probation.gov.uk',
      firstName: 'Joseph',
      lastName: 'Bloggs',
    } as UpdatePrisonCaseAdminRequest)

    expect(licenceApiClient.updatePrisonUserDetails).toBeCalledWith({
      staffUsername: 'joebloggs',
      staffEmail: 'joebloggs@probation.gov.uk',
      firstName: 'Joseph',
      lastName: 'Bloggs',
    })
  })

  it('should update the probation team for an offender', async () => {
    await licenceService.updateProbationTeam('X1234', {
      probationAreaCode: 'N02',
      probationAreaDescription: 'N02 Region',
      probationPduCode: 'PDU2',
      probationPduDescription: 'PDU2 Description',
      probationLauCode: 'LAU2',
      probationLauDescription: 'LAU2 Description',
      probationTeamCode: 'Team2',
      probationTeamDescription: 'Team2 Description',
    } as UpdateProbationTeamRequest)

    expect(licenceApiClient.updateProbationTeam).toBeCalledWith('X1234', {
      probationAreaCode: 'N02',
      probationAreaDescription: 'N02 Region',
      probationPduCode: 'PDU2',
      probationPduDescription: 'PDU2 Description',
      probationLauCode: 'LAU2',
      probationLauDescription: 'LAU2 Description',
      probationTeamCode: 'Team2',
      probationTeamDescription: 'Team2 Description',
    })
  })

  it('should edit a licence', async () => {
    await licenceService.editApprovedLicence('1', user)
    expect(licenceApiClient.editLicence).toBeCalledWith('1', user)
  })

  it('should create licence variation', async () => {
    await licenceService.createVariation('1', user)
    expect(licenceApiClient.createVariation).toBeCalledWith('1', user)
  })

  it('should update spo discussion', async () => {
    await licenceService.updateSpoDiscussion('1', { spoDiscussion: 'Yes' }, user)
    expect(licenceApiClient.updateSpoDiscussion).toBeCalledWith('1', { spoDiscussion: 'Yes' }, user)
  })

  it('should update vlo discussion', async () => {
    await licenceService.updateVloDiscussion('1', { vloDiscussion: 'Yes' }, user)
    expect(licenceApiClient.updateVloDiscussion).toBeCalledWith('1', { vloDiscussion: 'Yes' }, user)
  })

  it('should update reason for variation', async () => {
    await licenceService.updateReasonForVariation('1', { reasonForVariation: 'Reason' }, user)
    expect(licenceApiClient.updateReasonForVariation).toBeCalledWith('1', { reasonForVariation: 'Reason' }, user)
  })

  it('should discard licence', async () => {
    await licenceService.discard('1', user)
    expect(licenceApiClient.discard).toBeCalledWith('1', user)
  })

  it('should update prison information', async () => {
    await licenceService.updatePrisonInformation(
      '1',
      {
        prisonCode: 'PVI',
        prisonDescription: 'Pentonville (HMP)',
        prisonTelephone: '+44 276 54545',
      },
      user
    )
    expect(licenceApiClient.updatePrisonInformation).toBeCalledWith(
      '1',
      {
        prisonCode: 'PVI',
        prisonDescription: 'Pentonville (HMP)',
        prisonTelephone: '+44 276 54545',
      } as UpdatePrisonInformationRequest,
      user
    )
  })

  it('should update sentence dates', async () => {
    await licenceService.updateSentenceDates(
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
      },
      user
    )
    expect(licenceApiClient.updateSentenceDates).toBeCalledWith(
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
      user
    )
  })

  it('should approve a licence variation', async () => {
    await licenceService.approveVariation('1', user)
    expect(licenceApiClient.approveVariation).toBeCalledWith('1', user)
  })

  it('should refer a licence variation', async () => {
    await licenceService.referVariation('1', { reasonForReferral: 'Reason' }, user)
    expect(licenceApiClient.referVariation).toBeCalledWith('1', { reasonForReferral: 'Reason' }, user)
  })

  it('should compare variation with its original licence', async () => {
    const licenceCompatatorSpy = jest.spyOn(licenceComparator, 'default').mockReturnValue({} as VariedConditions)
    licenceApiClient.getLicenceById.mockResolvedValue({
      id: 1,
    } as Licence)

    await licenceService.compareVariationToOriginal({ id: 2, kind: 'VARIATION', variationOf: 1 } as Licence, user)

    expect(licenceCompatatorSpy).toBeCalledWith(
      {
        id: 1,
      },
      { id: 2, kind: 'VARIATION', variationOf: 1 }
    )
  })

  it('should get variation approval conversation', async () => {
    await licenceService.getApprovalConversation({ id: 1 } as Licence, user)
    expect(licenceApiClient.matchLicenceEvents).toBeCalledWith(
      '1',
      [LicenceEventType.VARIATION_SUBMITTED_REASON.valueOf(), LicenceEventType.VARIATION_REFERRED.valueOf()],
      'eventTime',
      'DESC',
      user
    )
  })

  describe('Exclusion zone file', () => {
    const myUploadFile = {
      path: 'test-file.txt',
      originalname: 'test',
      mimetype: 'application/pdf',
      size: 2020,
    } as Express.Multer.File

    it('Upload an exclusion zone file', async () => {
      await licenceService.uploadExclusionZoneFile('1', '1', myUploadFile, user, true)
      expect(licenceApiClient.uploadExclusionZoneFile).toHaveBeenCalledWith('1', '1', user, myUploadFile)
    })

    it('Remove an uploaded exclusion file', async () => {
      await licenceService.removeExclusionZoneFile('1', '1', user)
      expect(licenceApiClient.removeExclusionZoneFile).toHaveBeenCalledWith('1', '1', user)
    })

    it('Get the exclusion zone map image as base64 JPEG', async () => {
      licenceApiClient.getExclusionZoneImageData.mockResolvedValue(Buffer.from('image'))
      const result = await licenceService.getExclusionZoneImageData('1', '1', user)
      expect(result).toEqual(Buffer.from('image').toString('base64'))
      expect(licenceApiClient.getExclusionZoneImageData).toHaveBeenCalledWith('1', '1', user)
    })

    it('Get the exclusion zone map image as JPEG stream', async () => {
      licenceApiClient.getExclusionZoneImage.mockResolvedValue(Readable.from('image'))
      const result = await licenceService.getExclusionZoneImage('1', '1', user)
      expect(result.read()).toEqual('image')
      expect(licenceApiClient.getExclusionZoneImage).toHaveBeenCalledWith('1', '1', user)
    })
  })

  describe('Audit events', () => {
    const eventTime = parse('13/01/2022 11:00:00', 'dd/MM/yyyy HH:mm:ss', new Date())
    const eventStart = parse('12/01/2022 10:45:00', 'dd/MM/yyyy HH:mm:ss', new Date())
    const eventEnd = parse('13/01/2022 10:45:00', 'dd/MM/yyyy HH:mm:ss', new Date())

    it('will record a new audit event', async () => {
      await licenceService.recordAuditEvent('Summary', 'Detail', 1, eventTime, user)
      expect(licenceApiClient.recordAuditEvent).toHaveBeenCalledWith(
        {
          username: user.username,
          eventTime: format(eventTime, 'dd/MM/yyyy HH:mm:ss'),
          eventType: 'USER_EVENT',
          licenceId: 1,
          fullName: `${user.firstName} ${user.lastName}`,
          summary: 'Summary',
          detail: 'Detail',
        },
        user
      )
    })

    it('will get a list of events for a user', async () => {
      await licenceService.getAuditEvents(null, 'username', eventStart, eventEnd, user)
      expect(licenceApiClient.getAuditEvents).toHaveBeenCalledWith(
        {
          username: 'username',
          licenceId: null,
          startTime: format(eventStart, 'dd/MM/yyyy HH:mm:ss'),
          endTime: format(eventEnd, 'dd/MM/yyyy HH:mm:ss'),
        },
        user
      )
    })

    it('will get a list of events for licence', async () => {
      await licenceService.getAuditEvents(1, null, eventStart, eventEnd, user)
      expect(licenceApiClient.getAuditEvents).toHaveBeenCalledWith(
        {
          username: null,
          licenceId: 1,
          startTime: format(eventStart, 'dd/MM/yyyy HH:mm:ss'),
          endTime: format(eventEnd, 'dd/MM/yyyy HH:mm:ss'),
        },
        user
      )
    })
  })

  it('should notify the responsible officer with a prompt to create a licence', async () => {
    const expectedRequest = [
      { email: 'joe.bloggs@probation.gov.uk', comName: 'Joe Bloggs', initialPromptCases: [], urgentPromptCases: [] },
    ] as EmailContact[]
    await licenceService.notifyComsToPromptLicenceCreation(expectedRequest)
    expect(licenceApiClient.notifyComsToPromptEmailCreation).toBeCalledWith(expectedRequest)
  })

  describe('Get timeline events', () => {
    const originalLicence = {
      id: 1,
      kind: 'CRD',
      statusCode: LicenceStatus.ACTIVE,
      createdByFullName: 'Jackson Browne',
      dateLastUpdated: '10/11/2022 11:00:00',
    } as Licence

    const expectedEvents = [
      {
        eventType: 'CREATION',
        title: 'Licence created',
        statusCode: 'ACTIVE',
        createdBy: 'Jackson Browne',
        licenceId: 1,
        lastUpdate: '10/11/2022 11:00:00',
      },
    ] as unknown as TimelineEvent[]

    it('will return a list of timeline events for an approved variation', async () => {
      const licenceVariation = {
        id: 2,
        kind: 'VARIATION',
        statusCode: LicenceStatus.VARIATION_APPROVED,
        variationOf: 1,
        createdByFullName: 'James Brown',
        dateLastUpdated: '12/11/2022 10:45:00',
      } as Licence

      const variationApproved = {
        eventType: 'VARIATION',
        title: 'Licence varied',
        statusCode: 'VARIATION_APPROVED',
        createdBy: 'James Brown',
        licenceId: 2,
        lastUpdate: '12/11/2022 10:45:00',
      }

      licenceApiClient.getLicenceById.mockResolvedValue(originalLicence)
      const timelineEvents = await licenceService.getTimelineEvents(licenceVariation, user)
      expect(timelineEvents).toEqual([variationApproved, ...expectedEvents])
      expect(licenceApiClient.getLicenceById).toHaveBeenCalledWith(1, user)
    })

    it('will return a list of timeline events for a submitted variation', async () => {
      const licenceVariation = {
        id: 2,
        kind: 'VARIATION',
        statusCode: LicenceStatus.VARIATION_SUBMITTED,
        variationOf: 1,
        createdByFullName: 'James Brown',
        dateLastUpdated: '12/11/2022 10:45:00',
      } as Licence

      const variationSubmitted = {
        eventType: 'SUBMITTED',
        title: 'Variation submitted',
        statusCode: 'VARIATION_SUBMITTED',
        createdBy: 'James Brown',
        licenceId: 2,
        lastUpdate: '12/11/2022 10:45:00',
      }

      licenceApiClient.getLicenceById.mockResolvedValue(originalLicence)
      const timelineEvents = await licenceService.getTimelineEvents(licenceVariation, user)
      expect(timelineEvents).toEqual([variationSubmitted, ...expectedEvents])
      expect(licenceApiClient.getLicenceById).toHaveBeenCalledWith(1, user)
    })
    it('will return a list of timeline events for a rejected variation', async () => {
      const licenceVariation = {
        id: 2,
        kind: 'VARIATION',
        statusCode: LicenceStatus.VARIATION_REJECTED,
        variationOf: 1,
        createdByFullName: 'James Brown',
        dateLastUpdated: '12/11/2022 10:45:00',
      } as Licence

      const variationRejected = {
        eventType: 'REJECTED',
        title: 'Variation rejected',
        statusCode: 'VARIATION_REJECTED',
        createdBy: 'James Brown',
        licenceId: 2,
        lastUpdate: '12/11/2022 10:45:00',
      }

      licenceApiClient.getLicenceById.mockResolvedValue(originalLicence)
      const timelineEvents = await licenceService.getTimelineEvents(licenceVariation, user)
      expect(timelineEvents).toEqual([variationRejected, ...expectedEvents])
      expect(licenceApiClient.getLicenceById).toHaveBeenCalledWith(1, user)
    })

    it('will get variations of a licence', async () => {
      const nomisId = '250412'
      const licenceVariation = {
        licenceId: 2,
        nomisId,
        licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
      } as LicenceSummary

      licenceApiClient.matchLicences.mockResolvedValue([licenceVariation])
      const licenceVariations = await licenceService.getIncompleteLicenceVariations(nomisId)

      expect(licenceVariations).toEqual([licenceVariation])
      expect(licenceApiClient.matchLicences).toHaveBeenCalledWith(
        [
          LicenceStatus.VARIATION_IN_PROGRESS,
          LicenceStatus.VARIATION_SUBMITTED,
          LicenceStatus.VARIATION_REJECTED,
          LicenceStatus.VARIATION_APPROVED,
        ],
        null,
        null,
        [nomisId],
        null,
        null,
        null,
        undefined
      )
    })
  })
})
