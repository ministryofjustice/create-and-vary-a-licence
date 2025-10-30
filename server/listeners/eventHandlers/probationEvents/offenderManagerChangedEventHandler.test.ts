import LicenceService from '../../../services/licenceService'
import { ProbationEventMessage } from '../../../@types/events'
import OffenderManagerChangedEventHandler from './offenderManagerChangedEventHandler'
import ProbationService from '../../../services/probationService'
import { DeliusManager } from '../../../@types/deliusClientTypes'

const probationService = new ProbationService(null) as jest.Mocked<ProbationService>
const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

jest.mock('../../../services/licenceService')
jest.mock('../../../services/probationService')

describe('Offender manager changed event handler', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  const handler = new OffenderManagerChangedEventHandler(probationService, licenceService)

  it('should handle case where the offender has no managers allocated', async () => {
    probationService.getResponsibleCommunityManager.mockResolvedValue(undefined)

    const event = {
      crn: 'X1234',
    } as ProbationEventMessage

    await handler.handle(event)

    expect(probationService.getResponsibleCommunityManager).toHaveBeenCalledWith('X1234')
    expect(licenceService.updateResponsibleCom).not.toHaveBeenCalled()
  })

  it('should update the responsible COM to the current RO in delius', async () => {
    probationService.getResponsibleCommunityManager.mockResolvedValue({
      code: 'X12344',
      id: 3000,
      username: 'joebloggs',
      email: 'joebloggs@probation.gov.uk',
      name: {
        forename: 'Joe',
        surname: 'Bloggs',
      },
      provider: {
        code: 'P1',
      },
    } as DeliusManager)

    const event = {
      crn: 'X1234',
    } as ProbationEventMessage

    await handler.handle(event)

    expect(probationService.getResponsibleCommunityManager).toHaveBeenCalledWith('X1234')
    expect(licenceService.updateResponsibleCom).toHaveBeenCalledWith('X1234', {
      staffIdentifier: 3000,
      staffCode: 'X12344',
      staffUsername: 'joebloggs',
      staffEmail: 'joebloggs@probation.gov.uk',
      firstName: 'Joe',
      lastName: 'Bloggs',
    })
  })

  it('should update the probation team', async () => {
    probationService.getResponsibleCommunityManager.mockResolvedValue({
      code: 'X12344',
      id: 2000,
      username: 'joebloggs',
      email: 'joebloggs@probation.gov.uk',
      name: {
        forename: 'Joe',
        surname: 'Bloggs',
      },
      provider: {
        code: 'N02',
        description: 'N02 Region',
      },
      team: {
        code: 'Team2',
        description: 'Team2 Description',
        borough: {
          code: 'PDU2',
          description: 'PDU2 Description',
        },
        district: {
          code: 'LAU2',
          description: 'LAU2 Description',
        },
      },
    } as DeliusManager)

    const event = {
      crn: 'X1234',
    } as ProbationEventMessage

    await handler.handle(event)

    expect(licenceService.updateProbationTeam).toHaveBeenCalledWith('X1234', {
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

  it('should not update the responsible COM if the COM does not have a username', async () => {
    probationService.getResponsibleCommunityManager.mockResolvedValue({
      code: 'X12344',
      id: 2000,
    } as DeliusManager)

    const event = {
      crn: 'X1234',
    } as ProbationEventMessage

    await handler.handle(event)

    expect(licenceService.updateResponsibleCom).not.toHaveBeenCalled()
  })

  it('should not update the responsible COM if no offenderManagers', async () => {
    probationService.getResponsibleCommunityManager.mockResolvedValue(undefined)

    const event = {
      crn: 'X1234',
    } as ProbationEventMessage

    await handler.handle(event)

    expect(licenceService.updateResponsibleCom).not.toHaveBeenCalled()
  })

  it('should assign the COM to a role if they do not have it already', async () => {
    probationService.getResponsibleCommunityManager.mockResolvedValue({ username: 'joebloggs' } as DeliusManager)

    const event = {
      crn: 'X1234',
    } as ProbationEventMessage

    await handler.handle(event)

    expect(probationService.assignDeliusRole).toHaveBeenCalledWith('JOEBLOGGS')
  })
})
