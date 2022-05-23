import { Readable } from 'stream'
import moment from 'moment'
import { User } from '../@types/CvlUserDetails'
import LicenceApiClient from '../data/licenceApiClient'
import LicenceService from './licenceService'
import PrisonerService from './prisonerService'
import CommunityService from './communityService'
import * as conditionsProvider from '../utils/conditionsProvider'
import * as utils from '../utils/utils'
import * as licenceComparator from '../utils/licenceComparator'
import { PrisonApiPrisoner, PrisonInformation } from '../@types/prisonApiClientTypes'
import { OffenderDetail } from '../@types/probationSearchApiClientTypes'
import SimpleDateTime from '../routes/creatingLicences/types/simpleDateTime'
import Address from '../routes/creatingLicences/types/address'
import LicenceType from '../enumeration/licenceType'
import AdditionalConditions from '../routes/creatingLicences/types/additionalConditions'
import SimpleDate from '../routes/creatingLicences/types/date'
import BespokeConditions from '../routes/creatingLicences/types/bespokeConditions'
import LicenceStatus from '../enumeration/licenceStatus'
import {
  AdditionalCondition,
  EmailContact,
  Licence,
  LicenceSummary,
  UpdateComRequest,
  UpdatePrisonInformationRequest,
  UpdateProbationTeamRequest,
  UpdateSentenceDatesRequest,
} from '../@types/licenceApiClientTypes'
import { CommunityApiOffenderManager } from '../@types/communityClientTypes'
import { VariedConditions } from '../utils/licenceComparator'
import LicenceEventType from '../enumeration/licenceEventType'
import TimelineEvent from '../@types/TimelineEvent'

jest.mock('../data/licenceApiClient')
jest.mock('./communityService')
jest.mock('./prisonerService')
jest.spyOn(utils, 'convertDateFormat').mockImplementation((value: string) => value)
jest.spyOn(conditionsProvider, 'expandAdditionalCondition').mockImplementation(() => 'condition')

const getConditionsSpy = jest
  .spyOn(conditionsProvider, 'getStandardConditions')
  .mockReturnValue([{ text: 'fake standard condition' }])

describe('Licence Service', () => {
  const licenceApiClient = new LicenceApiClient() as jest.Mocked<LicenceApiClient>
  const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
  const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
  const licenceService = new LicenceService(licenceApiClient, prisonerService, communityService)

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
    beforeEach(() => {
      prisonerService.getPrisonerDetail.mockResolvedValue({} as PrisonApiPrisoner)
      communityService.getProbationer.mockResolvedValue({
        offenderManagers: [{ active: true, staff: { code: 'X12345' } }],
      } as OffenderDetail)
      prisonerService.getPrisonInformation.mockResolvedValue({ phones: [] } as PrisonInformation)
      communityService.getAnOffendersManagers.mockResolvedValue([
        {
          isResponsibleOfficer: true,
          staffId: 2000,
          staffCode: 'X12345',
          probationArea: {
            code: 'Area',
            description: 'AreaDesc',
          },
          team: {
            code: 'Team',
            description: 'TeamDesc',
            borough: {
              code: 'PDU',
              description: 'PDUDesc',
            },
            district: {
              code: 'LAU',
              description: 'LAUDesc',
            },
          },
        } as CommunityApiOffenderManager,
      ])
    })

    describe('Licence Types', () => {
      it('Should create an AP licence when a TUSED is not set in NOMIS', async () => {
        prisonerService.getPrisonerDetail.mockResolvedValue({} as PrisonApiPrisoner)
        const expectedLicence = expect.objectContaining({ typeCode: 'AP' })

        await licenceService.createLicence('ABC1234', user)
        expect(licenceApiClient.createLicence).toBeCalledWith(expectedLicence, user)
      })

      it('Should create a PSS licence when LED and SED is not set but TUSED is set', async () => {
        prisonerService.getPrisonerDetail.mockResolvedValue({
          sentenceDetail: { topupSupervisionExpiryDate: '26/12/2022' },
        } as PrisonApiPrisoner)
        const expectedLicence = expect.objectContaining({ typeCode: 'PSS' })

        await licenceService.createLicence('ABC1234', user)
        expect(licenceApiClient.createLicence).toBeCalledWith(expectedLicence, user)
      })

      it('Should create a AP_PSS licence when LED is not set but TUSED and SED is set', async () => {
        prisonerService.getPrisonerDetail.mockResolvedValue({
          sentenceDetail: {
            topupSupervisionExpiryDate: '26/12/2022',
            sentenceExpiryDate: '26/12/2023',
          },
        } as PrisonApiPrisoner)
        const expectedLicence = expect.objectContaining({ typeCode: 'AP_PSS' })

        await licenceService.createLicence('ABC1234', user)
        expect(licenceApiClient.createLicence).toBeCalledWith(expectedLicence, user)
      })

      it('Should create a AP_PSS licence when SED is not set but TUSED and LED is set', async () => {
        prisonerService.getPrisonerDetail.mockResolvedValue({
          sentenceDetail: {
            topupSupervisionExpiryDate: '26/12/2022',
            licenceExpiryDate: '26/12/2023',
          },
        } as PrisonApiPrisoner)
        const expectedLicence = expect.objectContaining({ typeCode: 'AP_PSS' })

        await licenceService.createLicence('ABC1234', user)
        expect(licenceApiClient.createLicence).toBeCalledWith(expectedLicence, user)
      })

      it('Should create a AP_PSS licence when SLED and TUSED are set', async () => {
        prisonerService.getPrisonerDetail.mockResolvedValue({
          sentenceDetail: {
            topupSupervisionExpiryDate: '26/12/2022',
            licenceExpiryDate: '26/12/2023',
            sentenceExpiryDate: '26/12/2023',
          },
        } as PrisonApiPrisoner)
        const expectedLicence = expect.objectContaining({ typeCode: 'AP_PSS' })

        await licenceService.createLicence('ABC1234', user)
        expect(licenceApiClient.createLicence).toBeCalledWith(expectedLicence, user)
      })
    })

    describe('Conditional release date', () => {
      it('Should set CRD using the override date from NOMIS if it exists', async () => {
        prisonerService.getPrisonerDetail.mockResolvedValue({
          sentenceDetail: {
            conditionalReleaseOverrideDate: '26/12/2022',
            conditionalReleaseDate: '17/06/2023',
          },
        } as PrisonApiPrisoner)
        const expectedLicence = expect.objectContaining({ conditionalReleaseDate: '26/12/2022' })

        await licenceService.createLicence('ABC1234', user)
        expect(licenceApiClient.createLicence).toBeCalledWith(expectedLicence, user)
      })

      it('Should set CRD when override date does not exist', async () => {
        prisonerService.getPrisonerDetail.mockResolvedValue({
          sentenceDetail: {
            conditionalReleaseDate: '17/06/2023',
          },
        } as PrisonApiPrisoner)
        const expectedLicence = expect.objectContaining({ conditionalReleaseDate: '17/06/2023' })

        await licenceService.createLicence('ABC1234', user)
        expect(licenceApiClient.createLicence).toBeCalledWith(expectedLicence, user)
      })
    })

    describe('Licence start date', () => {
      it('Should set start date using the release date from NOMIS if it exists', async () => {
        prisonerService.getPrisonerDetail.mockResolvedValue({
          sentenceDetail: {
            confirmedReleaseDate: '26/12/2022',
            conditionalReleaseDate: '1/03/2023',
          },
        } as PrisonApiPrisoner)
        const expectedLicence = expect.objectContaining({ licenceStartDate: '26/12/2022' })

        await licenceService.createLicence('ABC1234', user)
        expect(licenceApiClient.createLicence).toBeCalledWith(expectedLicence, user)
      })

      it('Should set start date using the conditional release date if release date and CRD override do not exist', async () => {
        prisonerService.getPrisonerDetail.mockResolvedValue({
          sentenceDetail: {
            conditionalReleaseDate: '1/03/2023',
          },
        } as PrisonApiPrisoner)
        const expectedLicence = expect.objectContaining({ licenceStartDate: '1/03/2023' })

        await licenceService.createLicence('ABC1234', user)
        expect(licenceApiClient.createLicence).toBeCalledWith(expectedLicence, user)
      })
    })

    describe('Prison description', () => {
      it('Should get prison description from NOMIS if it exists', async () => {
        prisonerService.getPrisonInformation.mockResolvedValue({
          phones: [],
          formattedDescription: 'Leeds (HMP)',
        } as PrisonInformation)
        const expectedLicence = expect.objectContaining({ prisonDescription: 'Leeds (HMP)' })

        await licenceService.createLicence('ABC1234', user)
        expect(licenceApiClient.createLicence).toBeCalledWith(expectedLicence, user)
      })

      it('Should set prison description to Not Known if it doesnt exist in NOMIS', async () => {
        prisonerService.getPrisonInformation.mockResolvedValue({ phones: [] } as PrisonInformation)
        const expectedLicence = expect.objectContaining({ prisonDescription: 'Not known' })

        await licenceService.createLicence('ABC1234', user)
        expect(licenceApiClient.createLicence).toBeCalledWith(expectedLicence, user)
      })
    })

    describe('Probation locations are populated', () => {
      it('Should populate probation locations from DELIUS', async () => {
        prisonerService.getPrisonerDetail.mockResolvedValue({} as PrisonApiPrisoner)
        const expectedLicence = expect.objectContaining({
          typeCode: 'AP',
          probationAreaCode: 'Area',
          probationAreaDescription: 'AreaDesc',
          probationPduCode: 'PDU',
          probationPduDescription: 'PDUDesc',
          probationLauCode: 'LAU',
          probationLauDescription: 'LAUDesc',
          probationTeamCode: 'Team',
          probationTeamDescription: 'TeamDesc',
        })

        await licenceService.createLicence('ABC1234', user)

        expect(licenceApiClient.createLicence).toBeCalledWith(expectedLicence, user)
      })
    })

    describe('Prison telephone', () => {
      it('Should build telephone from extension and number', async () => {
        prisonerService.getPrisonInformation.mockResolvedValue({
          phones: [
            {
              type: 'BUS',
              ext: '+44',
              number: '7864284926',
            },
            {
              type: 'FAX',
              ext: '+44',
              number: '800284729',
            },
          ],
        } as PrisonInformation)
        const expectedLicence = expect.objectContaining({ prisonTelephone: '+44 7864284926' })

        await licenceService.createLicence('ABC1234', user)
        expect(licenceApiClient.createLicence).toBeCalledWith(expectedLicence, user)
      })

      it('Should build telephone from number where extension is not given', async () => {
        prisonerService.getPrisonInformation.mockResolvedValue({
          phones: [
            {
              type: 'BUS',
              number: '7864284926',
            },
          ],
        } as PrisonInformation)
        const expectedLicence = expect.objectContaining({ prisonTelephone: '7864284926' })

        await licenceService.createLicence('ABC1234', user)
        expect(licenceApiClient.createLicence).toBeCalledWith(expectedLicence, user)
      })
    })

    describe('Standard conditions', () => {
      it('Should get standard licence conditions only if licence type is AP', async () => {
        prisonerService.getPrisonerDetail.mockResolvedValue({} as PrisonApiPrisoner)
        const expectedLicence = expect.objectContaining({
          standardLicenceConditions: [{ text: 'fake standard condition' }],
          standardPssConditions: [],
        })

        await licenceService.createLicence('ABC1234', user)

        expect(getConditionsSpy).toBeCalledTimes(1)
        expect(getConditionsSpy).toBeCalledWith('AP')
        expect(licenceApiClient.createLicence).toBeCalledWith(expectedLicence, user)
      })

      it('Should get standard PSS conditions only if licence type is PSS', async () => {
        prisonerService.getPrisonerDetail.mockResolvedValue({
          sentenceDetail: { topupSupervisionExpiryDate: '26/12/2022' },
        } as PrisonApiPrisoner)
        const expectedLicence = expect.objectContaining({
          standardLicenceConditions: [],
          standardPssConditions: [{ text: 'fake standard condition' }],
        })

        await licenceService.createLicence('ABC1234', user)

        expect(getConditionsSpy).toBeCalledTimes(1)
        expect(getConditionsSpy).toBeCalledWith('PSS')
        expect(licenceApiClient.createLicence).toBeCalledWith(expectedLicence, user)
      })

      it('Should get both standard licence and PSS conditions if licence type is AP_PSS', async () => {
        prisonerService.getPrisonerDetail.mockResolvedValue({
          sentenceDetail: {
            topupSupervisionExpiryDate: '26/12/2022',
            licenceExpiryDate: '26/12/2023',
            sentenceExpiryDate: '26/12/2023',
          },
        } as PrisonApiPrisoner)
        const expectedLicence = expect.objectContaining({
          standardLicenceConditions: [{ text: 'fake standard condition' }],
          standardPssConditions: [{ text: 'fake standard condition' }],
        })

        await licenceService.createLicence('ABC1234', user)

        expect(getConditionsSpy).toBeCalledTimes(2)
        expect(getConditionsSpy).toHaveBeenNthCalledWith(1, 'AP')
        expect(getConditionsSpy).toHaveBeenNthCalledWith(2, 'PSS')
        expect(licenceApiClient.createLicence).toBeCalledWith(expectedLicence, user)
      })
    })
  })

  it('Get Licence', async () => {
    await licenceService.getLicence('1', user)
    expect(licenceApiClient.getLicenceById).toBeCalledWith('1', user)
  })

  it('Update appointment person', async () => {
    await licenceService.updateAppointmentPerson('1', { contactName: 'Joe Bloggs' }, user)
    expect(licenceApiClient.updateAppointmentPerson).toBeCalledWith('1', { appointmentPerson: 'Joe Bloggs' }, user)
  })

  it('Update appointment time', async () => {
    const timeConverter = jest.spyOn(utils, 'simpleDateTimeToJson').mockReturnValue('22/12/2022 12:20')
    await licenceService.updateAppointmentTime(
      '1',
      {
        date: { day: '22', month: '12', year: '2022' },
        time: { hour: '12', minute: '20', ampm: 'pm' },
      } as SimpleDateTime,
      user
    )
    expect(licenceApiClient.updateAppointmentTime).toBeCalledWith('1', { appointmentTime: '22/12/2022 12:20' }, user)
    expect(timeConverter).toBeCalledWith({
      date: { day: '22', month: '12', year: '2022' },
      time: { hour: '12', minute: '20', ampm: 'pm' },
    } as SimpleDateTime)
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
      await licenceService.updateAdditionalConditions('1', LicenceType.AP, {} as AdditionalConditions, user)
      expect(licenceApiClient.updateAdditionalConditions).toBeCalledWith(
        '1',
        { additionalConditions: [], conditionType: 'AP' },
        user
      )
    })

    it('should build list of conditions correctly with index numbers and short category name if it exists', async () => {
      const conditionConfigProvider = jest
        .spyOn(conditionsProvider, 'getAdditionalConditionByCode')
        .mockReturnValueOnce({
          categoryShort: 'Short category name',
          category: 'Longer category name',
          text: 'Condition 1',
        })
        .mockReturnValueOnce({
          category: 'Longer category name',
          text: 'Condition 2',
        })

      await licenceService.updateAdditionalConditions(
        '1',
        LicenceType.AP,
        { additionalConditions: ['code1', 'code2'] },
        user
      )
      expect(licenceApiClient.updateAdditionalConditions).toBeCalledWith(
        '1',
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
      expect(conditionConfigProvider).toBeCalledTimes(2)
      expect(conditionConfigProvider).toHaveBeenNthCalledWith(1, 'code1')
      expect(conditionConfigProvider).toHaveBeenNthCalledWith(2, 'code2')
    })
  })

  describe('Update additional conditions data', () => {
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
      expect(licenceApiClient.updateAdditionalConditionData).toBeCalledWith(
        '1',
        '2',
        { data: [], expandedConditionText: 'condition' },
        user
      )
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
          expandedConditionText: 'condition',
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
          expandedConditionText: 'condition',
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
      await licenceService.updateStatus('1', LicenceStatus.APPROVED, user)
      expect(licenceApiClient.updateLicenceStatus).toBeCalledWith(
        '1',
        { status: 'APPROVED', username: 'joebloggs', fullName: 'Joe Bloggs' },
        user
      )
    })

    it('should send SYSTEM as user if user is not defined', async () => {
      await licenceService.updateStatus('1', LicenceStatus.APPROVED)
      expect(licenceApiClient.updateLicenceStatus).toBeCalledWith(
        '1',
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

    await licenceService.getLicencesForApproval(user)
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

    const result = await licenceService.getLicencesForOmu(user)
    expect(licenceApiClient.matchLicences).toBeCalledWith(
      ['ACTIVE', 'APPROVED', 'SUBMITTED', 'IN_PROGRESS'],
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

    await licenceService.compareVariationToOriginal({ id: 2, variationOf: 1 } as Licence, user)

    expect(licenceCompatatorSpy).toBeCalledWith(
      {
        id: 1,
      },
      { id: 2, variationOf: 1 }
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
    const eventTime = moment('13/01/2022 11:00:00', 'DD/MM/YYYY HH:mm:ss').toDate()
    const eventStart = moment('12/01/2022 10:45:00', 'DD/MM/YYYY HH:mm:ss').toDate()
    const eventEnd = moment('13/01/2022 10:45:00', 'DD/MM/YYYY HH:mm:ss').toDate()

    it('will record a new audit event', async () => {
      await licenceService.recordAuditEvent('Summary', 'Detail', 1, eventTime, user)
      expect(licenceApiClient.recordAuditEvent).toHaveBeenCalledWith(
        {
          username: user.username,
          eventTime: moment(eventTime).format('DD/MM/YYYY HH:mm:ss'),
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
          startTime: moment(eventStart).format('DD/MM/YYYY HH:mm:ss'),
          endTime: moment(eventEnd).format('DD/MM/YYYY HH:mm:ss'),
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
          startTime: moment(eventStart).format('DD/MM/YYYY HH:mm:ss'),
          endTime: moment(eventEnd).format('DD/MM/YYYY HH:mm:ss'),
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
    const licenceVariation = {
      id: 2,
      statusCode: LicenceStatus.VARIATION_APPROVED,
      variationOf: 1,
      isVariation: true,
      createdByFullName: 'James Brown',
      dateLastUpdated: '12/11/2022 10:45:00',
    } as Licence

    const originalLicence = {
      id: 1,
      statusCode: LicenceStatus.ACTIVE,
      variationOf: null,
      isVariation: false,
      createdByFullName: 'Jackson Browne',
      dateLastUpdated: '10/11/2022 11:00:00',
    } as Licence

    const expectedEvents = [
      {
        eventType: 'VARIATION',
        title: 'Licence varied',
        statusCode: 'VARIATION_APPROVED',
        createdBy: 'James Brown',
        licenceId: 2,
        lastUpdate: '12/11/2022 10:45:00',
      },
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
      licenceApiClient.getLicenceById.mockResolvedValue(originalLicence)
      const timelineEvents = await licenceService.getTimelineEvents(licenceVariation, user)
      expect(timelineEvents).toEqual(expectedEvents)
      expect(licenceApiClient.getLicenceById).toHaveBeenCalledWith('1', user)
    })
  })
})
