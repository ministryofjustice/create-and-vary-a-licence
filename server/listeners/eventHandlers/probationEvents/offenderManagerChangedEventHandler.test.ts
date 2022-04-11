import LicenceService from '../../../services/licenceService'
import { ProbationEventMessage } from '../../../@types/events'
import OffenderManagerChangedEventHandler from './offenderManagerChangedEventHandler'
import CommunityService from '../../../services/communityService'
import { OffenderDetail } from '../../../@types/probationSearchApiClientTypes'
import { CommunityApiUserDetails } from '../../../@types/communityClientTypes'

const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>

jest.mock('../../../services/licenceService')
jest.mock('../../../services/communityService')

describe('Offender manager changed event handler', () => {
  beforeEach(() => {
    communityService.getUserDetailsByUsername.mockResolvedValue({
      roles: [{ name: 'LHDCBT002' }],
    } as CommunityApiUserDetails)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const handler = new OffenderManagerChangedEventHandler(communityService, licenceService)

  it('should handle case where the offender has no managers allocated', async () => {
    communityService.getAnOffendersManagers.mockResolvedValue([])
    communityService.getProbationer.mockResolvedValue({ offenderManagers: [] } as OffenderDetail)

    const event = {
      crn: 'X1234',
    } as ProbationEventMessage

    await handler.handle(event)

    expect(communityService.getAnOffendersManagers).toHaveBeenCalledWith('X1234')
    expect(communityService.getStaffDetailByStaffIdentifier).not.toHaveBeenCalled()
    expect(licenceService.updateResponsibleCom).not.toHaveBeenCalled()
  })

  it('should update the responsible COM to the current RO in delius', async () => {
    communityService.getProbationer.mockResolvedValue({
      offenderManagers: [
        {
          active: true,
          staff: {
            code: 'X12345',
          },
        },
      ],
    } as OffenderDetail)
    communityService.getAnOffendersManagers.mockResolvedValue([
      {
        staffCode: 'X12344',
        staffId: 2000,
      },
      {
        staffCode: 'X12345',
        staffId: 3000,
      },
    ])
    communityService.getStaffDetailByStaffIdentifier.mockResolvedValue({
      staffIdentifier: 3000,
      username: 'joebloggs',
      email: 'joebloggs@probation.gov.uk',
    })

    const event = {
      crn: 'X1234',
    } as ProbationEventMessage

    await handler.handle(event)

    expect(communityService.getAnOffendersManagers).toHaveBeenCalledWith('X1234')
    expect(communityService.getStaffDetailByStaffIdentifier).toHaveBeenCalledWith(3000)
    expect(licenceService.updateResponsibleCom).toHaveBeenCalledWith('X1234', {
      staffIdentifier: 3000,
      staffUsername: 'joebloggs',
      staffEmail: 'joebloggs@probation.gov.uk',
    })
  })

  it('should not update the responsible COM if the COM does not have a username', async () => {
    communityService.getProbationer.mockResolvedValue({
      offenderManagers: [
        {
          active: true,
          staff: {
            code: 'X12345',
          },
        },
      ],
    } as OffenderDetail)
    communityService.getAnOffendersManagers.mockResolvedValue([
      {
        staffCode: 'X12344',
        staffId: 2000,
      },
      {
        staffCode: 'X12345',
        staffId: 3000,
      },
    ])
    communityService.getStaffDetailByStaffIdentifier.mockResolvedValue({
      staffIdentifier: 3000,
      email: 'joebloggs@probation.gov.uk',
    })

    const event = {
      crn: 'X1234',
    } as ProbationEventMessage

    await handler.handle(event)

    expect(communityService.getAnOffendersManagers).toHaveBeenCalledWith('X1234')
    expect(communityService.getStaffDetailByStaffIdentifier).toHaveBeenCalledWith(3000)
    expect(licenceService.updateResponsibleCom).not.toHaveBeenCalled()
  })

  it('should assign the COM to a role if they do not have it already', async () => {
    communityService.getProbationer.mockResolvedValue({
      offenderManagers: [
        {
          active: true,
          staff: {
            code: 'X12345',
          },
        },
      ],
    } as OffenderDetail)
    communityService.getAnOffendersManagers.mockResolvedValue([
      {
        staffCode: 'X12345',
        staffId: 3000,
      },
    ])
    communityService.getStaffDetailByStaffIdentifier.mockResolvedValue({
      staffIdentifier: 3000,
      username: 'joebloggs',
      email: 'joebloggs@probation.gov.uk',
    })
    communityService.getUserDetailsByUsername.mockResolvedValue({ roles: [] } as CommunityApiUserDetails)

    const event = {
      crn: 'X1234',
    } as ProbationEventMessage

    await handler.handle(event)

    expect(communityService.assignDeliusRole).toHaveBeenCalledWith('JOEBLOGGS', 'LHDCBT002')
  })
})
