import { Readable } from 'stream'
import { format } from 'date-fns'
import { User } from '../@types/CvlUserDetails'
import LicenceApiClient from '../data/licenceApiClient'
import LicenceService from './licenceService'
import * as utils from '../utils/utils'
import * as licenceComparator from '../utils/licenceComparator'
import { VariedConditions } from '../utils/licenceComparator'
import DateTime from '../routes/initialAppointment/types/dateTime'
import Address from '../routes/initialAppointment/types/address'
import LicenceType from '../enumeration/licenceType'
import AdditionalConditions from '../routes/manageConditions/types/additionalConditions'
import SimpleDate from '../routes/creatingLicences/types/date'
import BespokeConditions from '../routes/manageConditions/types/bespokeConditions'
import LicenceStatus from '../enumeration/licenceStatus'
import {
  AdditionalCondition,
  ContactNumberRequest,
  Licence,
  LicenceSummary,
  PrisonerWithCvlFields,
  StandardCondition,
  UpdateElectronicMonitoringProgrammeRequest,
  UpdatePrisonInformationRequest,
  UpdatePrisonUserRequest,
} from '../@types/licenceApiClientTypes'
import LicenceEventType from '../enumeration/licenceEventType'
import ConditionService from './conditionService'
import { AdditionalConditionsConfig } from '../@types/LicencePolicy'
import TelephoneNumbers from '../routes/initialAppointment/types/telephoneNumbers'

jest.mock('../data/licenceApiClient')
jest.mock('./conditionService')
jest.spyOn(utils, 'convertDateFormat').mockImplementation((value: string) => value)

describe('Licence Service', () => {
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const conditionService = new ConditionService(licenceApiClient) as jest.Mocked<ConditionService>
  const licenceService = new LicenceService(licenceApiClient, conditionService)

  conditionService.getStandardConditions.mockResolvedValue({} as StandardCondition[])
  conditionService.getAdditionalConditions.mockResolvedValue({} as AdditionalConditionsConfig)

  conditionService.getStandardConditions.mockResolvedValue([
    { id: 1, text: 'fake standard condition', code: 'fake1', sequence: 1 },
  ])

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
    it('Should create a CRD licence in the backend API', async () => {
      await licenceService.createLicence({ nomsId: 'ABC1234', type: 'CRD' }, user)
      expect(licenceApiClient.createLicence).toHaveBeenCalledWith({ nomsId: 'ABC1234', type: 'CRD' }, user)
    })

    it('Should create a HARD_STOP licence in the backend API', async () => {
      await licenceService.createLicence({ nomsId: 'ABC1235', type: 'HARD_STOP' }, user)
      expect(licenceApiClient.createLicence).toHaveBeenCalledWith({ nomsId: 'ABC1235', type: 'HARD_STOP' }, user)
    })

    it('Should create a HARD_STOP licence in the backend API', async () => {
      await licenceService.createLicence({ nomsId: 'ABC1235', type: 'HARD_STOP' }, user)
      expect(licenceApiClient.createLicence).toHaveBeenCalledWith({ nomsId: 'ABC1235', type: 'HARD_STOP' }, user)
    })
  })

  it('Get Licence', async () => {
    await licenceService.getLicence(1, user)
    expect(licenceApiClient.getLicenceById).toHaveBeenCalledWith(1, user)
  })

  it('Update appointment person with type SPECIFIC_PERSON', async () => {
    await licenceService.updateAppointmentPerson(
      '1',
      {
        contactName: 'Joe Bloggs',
        appointmentPersonType: 'SPECIFIC_PERSON',
      },
      user,
    )
    expect(licenceApiClient.updateAppointmentPerson).toHaveBeenCalledWith(
      '1',
      { appointmentPerson: 'Joe Bloggs', appointmentPersonType: 'SPECIFIC_PERSON' },
      user,
    )
  })

  it('Update appointment person with type DUTY_OFFICER', async () => {
    await licenceService.updateAppointmentPerson(
      '1',
      {
        contactName: '',
        appointmentPersonType: 'DUTY_OFFICER',
      },
      user,
    )
    expect(licenceApiClient.updateAppointmentPerson).toHaveBeenCalledWith(
      '1',
      { appointmentPerson: '', appointmentPersonType: 'DUTY_OFFICER' },
      user,
    )
  })

  it('Update appointment person with type DUTY_OFFICER', async () => {
    await licenceService.updateAppointmentPerson(
      '1',
      {
        contactName: '',
        appointmentPersonType: 'DUTY_OFFICER',
      },
      user,
    )
    expect(licenceApiClient.updateAppointmentPerson).toHaveBeenCalledWith(
      '1',
      { appointmentPerson: '', appointmentPersonType: 'DUTY_OFFICER' },
      user,
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
      user,
    )
    expect(licenceApiClient.updateAppointmentTime).toHaveBeenCalledWith(
      '1',
      { appointmentTime: '22/12/2022 12:20', appointmentTimeType: 'SPECIFIC_DATE_TIME' },
      user,
    )
    expect(timeConverter).toHaveBeenCalledWith({
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
      user,
    )
    expect(licenceApiClient.updateAppointmentTime).toHaveBeenCalledWith(
      '1',
      { appointmentTime: null, appointmentTimeType: 'IMMEDIATE_UPON_RELEASE' },
      user,
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
      user,
    )
    expect(licenceApiClient.updateAppointmentAddress).toHaveBeenCalledWith(
      '1',
      { appointmentAddress: '123 Fake Street, Fakestown' },
      user,
    )
    expect(addressConverter).toHaveBeenCalledWith({
      addressLine1: '123 Fake Street',
      addressTown: 'Fakestown',
    } as Address)
  })

  it('Update contact number', async () => {
    // Given
    const telephoneNumbers = {
      telephone: '07624726976',
      telephoneAlternative: '0123877368',
    }

    // When
    await licenceService.updateContactNumber('1', telephoneNumbers as TelephoneNumbers, user)

    // Then
    expect(licenceApiClient.updateContactNumber).toHaveBeenCalledWith(
      '1',
      telephoneNumbers as ContactNumberRequest,
      user,
    )
  })

  describe('Update additional conditions', () => {
    it('should handle undefined list of additional conditions', async () => {
      await licenceService.updateAdditionalConditions(1, LicenceType.AP, {} as AdditionalConditions, user, 'version')
      expect(licenceApiClient.updateAdditionalConditions).toHaveBeenCalledWith(
        1,
        { additionalConditions: [], conditionType: 'AP' },
        user,
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
        'version',
      )
      expect(licenceApiClient.updateAdditionalConditions).toHaveBeenCalledWith(
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
        user,
      )
      expect(conditionService.getAdditionalConditionByCode).toHaveBeenCalledTimes(2)
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
        user,
      )
      expect(licenceApiClient.updateAdditionalConditionData).toHaveBeenCalledWith('1', '2', { data: [] }, user)
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
        user,
      )
      expect(licenceApiClient.updateAdditionalConditionData).toHaveBeenCalledWith(
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
        user,
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
        user,
      )
      expect(licenceApiClient.updateAdditionalConditionData).toHaveBeenCalledWith(
        '1',
        '2',
        {
          data: [
            {
              field: 'key1',
              value: 'Thursday 22 December 2022',
              sequence: 0,
            },
          ],
        },
        user,
      )
    })
  })

  it('Update bespoke conditions', async () => {
    await licenceService.updateBespokeConditions(
      '1',
      { conditions: [undefined, null, '', 'condition1'] } as BespokeConditions,
      user,
    )
    expect(licenceApiClient.updateBespokeConditions).toHaveBeenCalledWith('1', { conditions: ['condition1'] }, user)
  })

  describe('Update status', () => {
    it('should update status successfully with user details', async () => {
      await licenceService.updateStatus(1, LicenceStatus.APPROVED, user)
      expect(licenceApiClient.updateLicenceStatus).toHaveBeenCalledWith(
        1,
        { status: 'APPROVED', username: 'joebloggs', fullName: 'Joe Bloggs' },
        user,
      )
    })

    it('should send SYSTEM as user if user is not defined', async () => {
      await licenceService.updateStatus(1, LicenceStatus.APPROVED)
      expect(licenceApiClient.updateLicenceStatus).toHaveBeenCalledWith(
        1,
        { status: 'APPROVED', username: 'SYSTEM', fullName: 'SYSTEM' },
        undefined,
      )
    })
  })

  it('Submit licence', async () => {
    await licenceService.submitLicence('1', user)
    expect(licenceApiClient.submitLicence).toHaveBeenCalledWith('1', [], user)
  })

  it('Submit variation', async () => {
    await licenceService.submitVariation('1', [{ name: 'Joe Bloggs', email: 'Email' }], user)
    expect(licenceApiClient.submitLicence).toHaveBeenCalledWith('1', [{ name: 'Joe Bloggs', email: 'Email' }], user)
  })

  it('Activate variation', async () => {
    await licenceService.activateVariation(1, user)
    expect(licenceApiClient.activateVariation).toHaveBeenCalledWith(1, user)
  })

  it('Get licences by nomis ids and statuses', async () => {
    await licenceService.getLicencesByNomisIdsAndStatus(['ABC1234'], [LicenceStatus.APPROVED], user)
    expect(licenceApiClient.matchLicences).toHaveBeenCalledWith({
      statuses: ['APPROVED'],
      nomisIds: ['ABC1234'],
      user,
    })
  })

  it('Get latest licence by nomis ids and statuses', async () => {
    licenceApiClient.matchLicences.mockResolvedValue([
      { licenceId: 1 } as LicenceSummary,
      { licenceId: 2 } as LicenceSummary,
    ])
    const result = await licenceService.getLatestLicenceByNomisIdsAndStatus(['ABC1234'], [], user)
    expect(licenceApiClient.matchLicences).toHaveBeenCalledWith({ statuses: [], nomisIds: ['ABC1234'], user })
    expect(result).toEqual({ licenceId: 2 })
  })

  it('should update prison user responsible for an offender', async () => {
    await licenceService.updatePrisonUserDetails({
      staffUsername: 'joebloggs',
      staffEmail: 'joebloggs@probation.gov.uk',
      firstName: 'Joseph',
      lastName: 'Bloggs',
    } as UpdatePrisonUserRequest)

    expect(licenceApiClient.updatePrisonUserDetails).toHaveBeenCalledWith({
      staffUsername: 'joebloggs',
      staffEmail: 'joebloggs@probation.gov.uk',
      firstName: 'Joseph',
      lastName: 'Bloggs',
    })
  })

  it('should edit a licence', async () => {
    await licenceService.editApprovedLicence('1', user)
    expect(licenceApiClient.editLicence).toHaveBeenCalledWith('1', user)
  })

  it('should create licence variation', async () => {
    await licenceService.createVariation('1', user)
    expect(licenceApiClient.createVariation).toHaveBeenCalledWith('1', user)
  })

  it('should update spo discussion', async () => {
    await licenceService.updateSpoDiscussion('1', { spoDiscussion: 'Yes' }, user)
    expect(licenceApiClient.updateSpoDiscussion).toHaveBeenCalledWith('1', { spoDiscussion: 'Yes' }, user)
  })

  it('should update vlo discussion', async () => {
    await licenceService.updateVloDiscussion('1', { vloDiscussion: 'Yes' }, user)
    expect(licenceApiClient.updateVloDiscussion).toHaveBeenCalledWith('1', { vloDiscussion: 'Yes' }, user)
  })

  it('should update reason for variation', async () => {
    await licenceService.updateReasonForVariation('1', { reasonForVariation: 'Reason' }, user)
    expect(licenceApiClient.updateReasonForVariation).toHaveBeenCalledWith('1', { reasonForVariation: 'Reason' }, user)
  })

  it('should discard licence', async () => {
    await licenceService.discard('1', user)
    expect(licenceApiClient.discard).toHaveBeenCalledWith('1', user)
  })

  it('should update prison information', async () => {
    await licenceService.updatePrisonInformation(
      '1',
      {
        prisonCode: 'PVI',
        prisonDescription: 'Pentonville (HMP)',
        prisonTelephone: '+44 276 54545',
      },
      user,
    )
    expect(licenceApiClient.updatePrisonInformation).toHaveBeenCalledWith(
      '1',
      {
        prisonCode: 'PVI',
        prisonDescription: 'Pentonville (HMP)',
        prisonTelephone: '+44 276 54545',
      } as UpdatePrisonInformationRequest,
      user,
    )
  })

  it('should update sentence dates', async () => {
    await licenceService.updateSentenceDates('1', user)
    expect(licenceApiClient.updateSentenceDates).toHaveBeenCalledWith('1', user)
  })

  it('should approve a licence variation', async () => {
    await licenceService.approveVariation('1', user)
    expect(licenceApiClient.approveVariation).toHaveBeenCalledWith('1', user)
  })

  it('should refer a licence variation', async () => {
    await licenceService.referVariation('1', { reasonForReferral: 'Reason' }, user)
    expect(licenceApiClient.referVariation).toHaveBeenCalledWith('1', { reasonForReferral: 'Reason' }, user)
  })

  it('should compare variation with its original licence', async () => {
    const licenceCompatatorSpy = jest.spyOn(licenceComparator, 'default').mockReturnValue({} as VariedConditions)
    licenceApiClient.getLicenceById.mockResolvedValue({
      id: 1,
    } as Licence)

    await licenceService.compareVariationToOriginal(
      { id: 2, kind: 'VARIATION', variationOf: 1, isVariation: true } as Licence,
      user,
    )

    expect(licenceCompatatorSpy).toHaveBeenCalledWith(
      {
        id: 1,
      },
      { id: 2, kind: 'VARIATION', variationOf: 1, isVariation: true },
    )
  })

  it('should get variation approval conversation', async () => {
    await licenceService.getApprovalConversation({ id: 1 } as Licence, user)
    expect(licenceApiClient.matchLicenceEvents).toHaveBeenCalledWith(
      '1',
      [LicenceEventType.VARIATION_SUBMITTED_REASON.valueOf(), LicenceEventType.VARIATION_REFERRED.valueOf()],
      'eventTime',
      'DESC',
      user,
    )
  })

  it('should review a licence with no variation required', async () => {
    await licenceService.reviewWithoutVariation(1, user)
    expect(licenceApiClient.reviewWithoutVariation).toHaveBeenCalledWith(1, user)
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
    const eventTime = utils.parseCvlDateTime('13/01/2022 11:00:00', { withSeconds: true })
    const eventStart = utils.parseCvlDateTime('12/01/2022 10:45:00', { withSeconds: true })
    const eventEnd = utils.parseCvlDateTime('13/01/2022 10:45:00', { withSeconds: true })

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
        user,
      )
    })

    it('will get a list of events for a user', async () => {
      await licenceService.getAuditEvents(user, null, 'username', eventStart, eventEnd)
      expect(licenceApiClient.getAuditEvents).toHaveBeenCalledWith(
        {
          username: 'username',
          licenceId: null,
          startTime: format(eventStart, 'dd/MM/yyyy HH:mm:ss'),
          endTime: format(eventEnd, 'dd/MM/yyyy HH:mm:ss'),
        },
        user,
      )
    })

    it('will get a list of events for licence', async () => {
      await licenceService.getAuditEvents(user, 1, null, eventStart, eventEnd)
      expect(licenceApiClient.getAuditEvents).toHaveBeenCalledWith(
        {
          username: null,
          licenceId: 1,
          startTime: format(eventStart, 'dd/MM/yyyy HH:mm:ss'),
          endTime: format(eventEnd, 'dd/MM/yyyy HH:mm:ss'),
        },
        user,
      )
    })
  })

  it('will get variations of a licence', async () => {
    const nomisId = 'A1234AA'
    const licenceVariation = {
      licenceId: 2,
      nomisId,
      licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
    } as LicenceSummary

    licenceApiClient.matchLicences.mockResolvedValue([licenceVariation])
    const licenceVariations = await licenceService.getIncompleteLicenceVariations(nomisId)

    expect(licenceVariations).toEqual([licenceVariation])
    expect(licenceApiClient.matchLicences).toHaveBeenCalledWith({
      statuses: [
        LicenceStatus.VARIATION_IN_PROGRESS,
        LicenceStatus.VARIATION_SUBMITTED,
        LicenceStatus.VARIATION_REJECTED,
        LicenceStatus.VARIATION_APPROVED,
      ],
      nomisIds: [nomisId],
      user: undefined,
    })
  })

  it('Get prisoner details', async () => {
    const prisonerDetails = {
      prisoner: {
        prisonerNumber: 'G4169UO',
        firstName: 'EMAJINHANY',
        lastName: 'ELYSASHA',
        dateOfBirth: '1962-04-26',
        status: 'ACTIVE IN',
        prisonId: 'BAI',
        sentenceStartDate: '2017-03-01',
        releaseDate: '2024-07-19',
        confirmedReleaseDate: '2024-07-19',
        sentenceExpiryDate: '2028-08-31',
        licenceExpiryDate: '2028-08-31',
        conditionalReleaseDate: '2022-09-01',
      },
      cvl: { licenceType: 'AP', hardStopDate: null, hardStopWarningDate: null },
    } as PrisonerWithCvlFields
    licenceApiClient.getPrisonerDetail.mockResolvedValue(prisonerDetails)
    const nomsId = 'G4169UO'
    const callToGetPrisonerDetails = await licenceService.getPrisonerDetail(nomsId, user)
    expect(licenceApiClient.getPrisonerDetail).toHaveBeenCalledWith(nomsId, user)
    expect(callToGetPrisonerDetails).toEqual(prisonerDetails)
  })

  it('Get IS-91 status', async () => {
    await licenceService.getIS91Status('ABC123')
    expect(licenceApiClient.getIS91Status).toHaveBeenCalledWith('ABC123')
  })

  describe('Update Electronic Monitoring Programme', () => {
    it('should update the electronic monitoring programme', async () => {
      const request: UpdateElectronicMonitoringProgrammeRequest = {
        isToBeTaggedForProgramme: true,
        programmeName: 'GPS',
      }
      await licenceService.updateElectronicMonitoringProgramme(1, request)
      expect(licenceApiClient.updateElectronicMonitoringProgramme).toHaveBeenCalledWith(1, request)
    })
  })

  describe('Can COM access licence', () => {
    it('should check if a COM has permission to view a licence', async () => {
      licenceApiClient.getLicencePermissions.mockResolvedValue({ view: true })
      await licenceService.canComAccessLicence(1, user)
      expect(licenceApiClient.getLicencePermissions).toHaveBeenCalled()
    })
  })

  describe('Get or create licence variation', () => {
    it('should get existing incomplete variation if one exists', async () => {
      const nomisId = 'A1234AA'
      const licenceId = '1'
      const existingVariation = {
        licenceId: 2,
        nomisId,
        licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
      } as LicenceSummary

      licenceApiClient.matchLicences.mockResolvedValue([existingVariation])
      const result = await licenceService.getOrCreateLicenceVariation(nomisId, licenceId, user)

      expect(result).toEqual(existingVariation)
      expect(licenceApiClient.matchLicences).toHaveBeenCalledWith({
        statuses: [
          LicenceStatus.VARIATION_IN_PROGRESS,
          LicenceStatus.VARIATION_SUBMITTED,
          LicenceStatus.VARIATION_REJECTED,
          LicenceStatus.VARIATION_APPROVED,
        ],
        nomisIds: [nomisId],
      })
    })

    it('should create a new variation if no incomplete variations exist', async () => {
      const nomisId = 'A1234AA'
      const licenceId = '1'
      const newVariation = {
        licenceId: 2,
        nomisId,
        licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
      } as LicenceSummary

      licenceApiClient.matchLicences.mockResolvedValue([])
      licenceApiClient.createVariation.mockResolvedValue(newVariation)
      const result = await licenceService.getOrCreateLicenceVariation(nomisId, licenceId, user)

      expect(result).toEqual(newVariation)
      expect(licenceApiClient.matchLicences).toHaveBeenCalledWith({
        statuses: [
          LicenceStatus.VARIATION_IN_PROGRESS,
          LicenceStatus.VARIATION_SUBMITTED,
          LicenceStatus.VARIATION_REJECTED,
          LicenceStatus.VARIATION_APPROVED,
        ],
        nomisIds: [nomisId],
      })
      expect(licenceApiClient.createVariation).toHaveBeenCalledWith(licenceId, user)
    })
  })
})
