import LicenceService from '../../../services/licenceService'
import ReleaseEventHandler from './releaseEventHandler'
import { DomainEvent } from '../../../@types/domainEvent'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import LicenceStatus from '../../../enumeration/licenceStatus'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>

describe('Release event handler', () => {
  const handler = new ReleaseEventHandler(licenceService)
  beforeEach(() => {
    licenceService.getLicencesByNomisIdsAndStatus = jest.fn()
    licenceService.updateStatus = jest.fn()
  })

  it('should skip the event if release reason is not RELEASED', async () => {
    const event = {
      additionalInformation: {
        reason: 'HOSPITAL',
      },
    } as DomainEvent

    await handler.handle(event)

    expect(licenceService.getLicencesByNomisIdsAndStatus).not.toHaveBeenCalled()
  })

  it('should not update any licences if the offender does not have a licence', async () => {
    const event = {
      additionalInformation: {
        reason: 'RELEASED',
        nomsNumber: 'ABC1234',
      },
    } as DomainEvent
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([])

    await handler.handle(event)

    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
      ['ABC1234'],
      ['IN_PROGRESS', 'SUBMITTED', 'REJECTED', 'APPROVED']
    )
    expect(licenceService.updateStatus).not.toHaveBeenCalled()
  })

  it('should update the licence to ACTIVE if the licence for the offender is APPROVED', async () => {
    const event = {
      additionalInformation: {
        reason: 'RELEASED',
        nomsNumber: 'ABC1234',
      },
    } as DomainEvent
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'APPROVED',
      } as LicenceSummary,
    ])

    await handler.handle(event)

    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
      ['ABC1234'],
      ['IN_PROGRESS', 'SUBMITTED', 'REJECTED', 'APPROVED']
    )
    expect(licenceService.updateStatus).toHaveBeenCalledWith('1', LicenceStatus.ACTIVE)
  })

  it('should update the licence to INACTIVE if the licence for the offender is not APPROVED', async () => {
    const event = {
      additionalInformation: {
        reason: 'RELEASED',
        nomsNumber: 'ABC1234',
      },
    } as DomainEvent
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'IN_PROGRESS',
      } as LicenceSummary,
    ])

    await handler.handle(event)

    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
      ['ABC1234'],
      ['IN_PROGRESS', 'SUBMITTED', 'REJECTED', 'APPROVED']
    )
    expect(licenceService.updateStatus).toHaveBeenCalledWith('1', LicenceStatus.INACTIVE)
  })
})
