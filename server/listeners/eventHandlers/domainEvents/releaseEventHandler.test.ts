import LicenceService from '../../../services/licenceService'
import ReleaseEventHandler from './releaseEventHandler'
import { DomainEventMessage } from '../../../@types/events'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import LicenceStatus from '../../../enumeration/licenceStatus'
import PrisonerService from '../../../services/prisonerService'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>

describe('Release event handler', () => {
  const handler = new ReleaseEventHandler(licenceService, prisonerService)
  beforeEach(() => {
    licenceService.getLicencesByNomisIdsAndStatus = jest.fn()
    licenceService.updateStatus = jest.fn()
    prisonerService.searchPrisoners = jest.fn()
    prisonerService.getActiveHdcStatus = jest.fn()
  })

  it('should skip the event if release reason is not RELEASED', async () => {
    const event = {
      additionalInformation: {
        reason: 'HOSPITAL',
      },
    } as DomainEventMessage

    await handler.handle(event)

    expect(licenceService.getLicencesByNomisIdsAndStatus).not.toHaveBeenCalled()
  })

  it('should not update any licences if the offender does not have a licence', async () => {
    const event = {
      additionalInformation: {
        reason: 'RELEASED',
        nomsNumber: 'ABC1234',
      },
    } as DomainEventMessage
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
    } as DomainEventMessage
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'APPROVED',
      } as LicenceSummary,
    ])
    prisonerService.searchPrisoners.mockResolvedValue([
      {
        bookingId: '111',
        restrictedPatient: false,
      },
    ])
    prisonerService.getActiveHdcStatus.mockResolvedValue(null)

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
    } as DomainEventMessage
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'IN_PROGRESS',
      } as LicenceSummary,
    ])
    prisonerService.searchPrisoners.mockResolvedValue([
      {
        bookingId: '111',
        restrictedPatient: false,
      },
    ])
    prisonerService.getActiveHdcStatus.mockResolvedValue(null)

    await handler.handle(event)

    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
      ['ABC1234'],
      ['IN_PROGRESS', 'SUBMITTED', 'REJECTED', 'APPROVED']
    )
    expect(licenceService.updateStatus).toHaveBeenCalledWith('1', LicenceStatus.INACTIVE)
  })

  it('should update the licence to INACTIVE if the HDC licence is APPROVED', async () => {
    const event = {
      additionalInformation: {
        reason: 'RELEASED',
        nomsNumber: 'ABC1234',
      },
    } as DomainEventMessage
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'APPROVED',
      } as LicenceSummary,
    ])
    prisonerService.searchPrisoners.mockResolvedValue([
      {
        bookingId: '111',
        restrictedPatient: false,
      },
    ])
    prisonerService.getActiveHdcStatus.mockResolvedValue({
      approvalStatus: LicenceStatus.APPROVED,
      bookingId: '111',
    })

    await handler.handle(event)

    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
      ['ABC1234'],
      ['IN_PROGRESS', 'SUBMITTED', 'REJECTED', 'APPROVED']
    )
    expect(licenceService.updateStatus).toHaveBeenCalledWith('1', LicenceStatus.INACTIVE)
  })

  it('should update the licence to ACTIVE if the licence for the offender is APPROVED and HDC status is NOT APPROVED', async () => {
    const event = {
      additionalInformation: {
        reason: 'RELEASED',
        nomsNumber: 'ABC1234',
      },
    } as DomainEventMessage
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'APPROVED',
      } as LicenceSummary,
    ])
    prisonerService.searchPrisoners.mockResolvedValue([
      {
        bookingId: '111',
        restrictedPatient: false,
      },
    ])
    prisonerService.getActiveHdcStatus.mockResolvedValue({
      approvalStatus: LicenceStatus.SUBMITTED,
      bookingId: '111',
    })

    await handler.handle(event)

    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
      ['ABC1234'],
      ['IN_PROGRESS', 'SUBMITTED', 'REJECTED', 'APPROVED']
    )
    expect(licenceService.updateStatus).toHaveBeenCalledWith('1', LicenceStatus.ACTIVE)
  })
})
