import { addDays, format } from 'date-fns'
import PrisonerService from '../prisonerService'
import CommunityService from '../communityService'
import LicenceService from '../licenceService'
import { ManagedCase } from '../../@types/managedCase'
import PromptListService from './promptListService'

jest.mock('../prisonerService')
jest.mock('../communityService')

describe('PromptList Service', () => {
  const tenDaysFromNow = format(addDays(new Date(), 10), 'yyyy-MM-dd')
  const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
  const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
  const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
  const serviceUnderTest = new PromptListService(prisonerService, communityService, licenceService)

  beforeEach(() => {
    communityService.getManagedOffenders.mockResolvedValue([])
    communityService.getManagedOffendersByTeam.mockResolvedValue([])
    communityService.getOffendersByCrn.mockResolvedValue([])
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([])
    prisonerService.getHdcStatuses.mockResolvedValue([])
    licenceService.getLicencesByNomisIdsAndStatus = jest.fn().mockResolvedValue([])
    licenceService.searchPrisonersByReleaseDate = jest.fn().mockResolvedValue([])
    licenceService.searchPrisonersByNomsIds = jest.fn().mockResolvedValue([])
    licenceService.getLicencesForVariationApproval = jest.fn().mockResolvedValue([])
    licenceService.getLicencesForOmu = jest.fn().mockResolvedValue([])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Does not call Licence API when no Nomis records are found', async () => {
    const offenders = [
      {
        nomisRecord: { prisonerNumber: null },
        cvlFields: {},
      } as ManagedCase,
    ]
    await serviceUnderTest.mapOffendersToLicences(offenders)
    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledTimes(0)
  })

  it('Calls Licence API when Nomis records are found', async () => {
    const offenders = [
      {
        nomisRecord: { prisonerNumber: 'ABC123', conditionalReleaseDate: tenDaysFromNow },
        cvlFields: { hardStopDate: '03/02/2023', hardStopWarningDate: '01/02/2023' },
      } as ManagedCase,
    ]
    await serviceUnderTest.mapOffendersToLicences(offenders)
    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledTimes(1)
  })

  describe('in the hard stop period', () => {
    it('Sets NOT_STARTED licences to TIMED_OUT when in the hard stop period', async () => {
      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([])
      const offenders = [
        {
          nomisRecord: { prisonerNumber: 'ABC123' },
          cvlFields: { isInHardStopPeriod: true },
        } as ManagedCase,
      ]
      const result = await serviceUnderTest.mapOffendersToLicences(offenders)
      expect(result).toMatchObject([
        {
          nomisRecord: {
            prisonerNumber: 'ABC123',
          },
          cvlFields: { isInHardStopPeriod: true },
          licences: [{ status: 'TIMED_OUT', type: 'PSS' }],
        },
      ])
    })
  })
})
