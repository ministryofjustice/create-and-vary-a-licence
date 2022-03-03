import LicenceService from '../../../services/licenceService'
import { ProbationEventMessage } from '../../../@types/events'
import OffenderManagerChangedEventHandler from './offenderManagerChangedEventHandler'
import CommunityService from '../../../services/communityService'

const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>

jest.mock('../../../services/licenceService')
jest.mock('../../../services/communityService')

describe('Offender manager changed event handler', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  const handler = new OffenderManagerChangedEventHandler(communityService, licenceService)

  it('should handle case where the offender has no managers allocated', async () => {
    communityService.getAnOffendersManagers.mockResolvedValue([])

    const event = {
      crn: 'X1234',
    } as ProbationEventMessage

    await handler.handle(event)

    expect(communityService.getAnOffendersManagers).toHaveBeenCalledWith('X1234')
    expect(communityService.getStaffDetailByStaffIdentifier).not.toHaveBeenCalled()
    expect(licenceService.updateResponsibleCom).not.toHaveBeenCalled()
  })

  it('should update the responsible COM to the current RO in delius', async () => {
    communityService.getAnOffendersManagers.mockResolvedValue([
      {
        staffId: 2000,
        isResponsibleOfficer: false,
      },
      {
        staffId: 3000,
        isResponsibleOfficer: true,
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
})
