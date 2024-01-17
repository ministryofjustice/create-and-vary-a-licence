import LicenceService from '../../../services/licenceService'
import ReleaseEventHandler from './releaseEventHandler'
import { DomainEventMessage } from '../../../@types/events'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import LicenceStatus from '../../../enumeration/licenceStatus'
import PrisonerService from '../../../services/prisonerService'

jest.mock('../../../services/prisonerService')
jest.mock('../../../services/licenceService')

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>

describe('Release event handler', () => {
  const handler = new ReleaseEventHandler(licenceService, prisonerService)
  beforeEach(() => {
    jest.resetAllMocks()
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
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue(undefined)

    await handler.handle(event)

    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
      ['ABC1234'],
      ['IN_PROGRESS', 'SUBMITTED', 'REJECTED', 'APPROVED']
    )
    expect(licenceService.updateStatus).not.toHaveBeenCalled()
  })

  it('should activated an APPROVED licence and deactivate any others', async () => {
    const event = {
      additionalInformation: {
        reason: 'RELEASED',
        nomsNumber: 'ABC1234',
      },
    } as DomainEventMessage
    const unapprovedLicences = [
      {
        licenceId: 2,
        licenceStatus: 'IN_PROGRESS',
      },
      {
        licenceId: 3,
        licenceStatus: 'SUBMITTED',
      },
      {
        licenceId: 4,
        licenceStatus: 'REJECTED',
      },
    ]
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'APPROVED',
      },
      ...unapprovedLicences,
    ] as LicenceSummary[])
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
    expect(licenceService.updateStatus).toHaveBeenCalledWith(1, LicenceStatus.ACTIVE)
    expect(licenceService.deactivateLicences).toHaveBeenCalledWith(unapprovedLicences)
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
      },
    ] as LicenceSummary[])
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
    expect(licenceService.deactivateLicences).toHaveBeenCalledWith([
      {
        licenceId: 1,
        licenceStatus: 'IN_PROGRESS',
      },
    ])
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
      },
    ] as LicenceSummary[])
    prisonerService.searchPrisoners.mockResolvedValue([
      {
        bookingId: '111',
        restrictedPatient: false,
      },
    ])
    prisonerService.isHdcApproved.mockResolvedValue(true)

    await handler.handle(event)

    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
      ['ABC1234'],
      ['IN_PROGRESS', 'SUBMITTED', 'REJECTED', 'APPROVED']
    )
    expect(licenceService.updateStatus).toHaveBeenCalledWith(1, LicenceStatus.INACTIVE)
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
      },
    ] as LicenceSummary[])
    prisonerService.searchPrisoners.mockResolvedValue([
      {
        bookingId: '111',
        restrictedPatient: false,
      },
    ])
    prisonerService.getActiveHdcStatus.mockResolvedValue({
      approvalStatus: 'REJECTED',
      bookingId: '111',
    })

    await handler.handle(event)

    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
      ['ABC1234'],
      ['IN_PROGRESS', 'SUBMITTED', 'REJECTED', 'APPROVED']
    )
    expect(licenceService.updateStatus).toHaveBeenCalledWith(1, LicenceStatus.ACTIVE)
  })

  it('should raise an error if there are multiple APPROVED licences', async () => {
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
      },
      {
        licenceId: 2,
        licenceStatus: 'APPROVED',
      },
    ] as LicenceSummary[])
    prisonerService.searchPrisoners.mockResolvedValue([
      {
        bookingId: '111',
        restrictedPatient: false,
      },
    ])
    prisonerService.getActiveHdcStatus.mockResolvedValue(null)

    expect(async () => {
      await handler.handle(event)
    }).rejects.toThrowError('Multiple approved licences found, unable to automatically activate')
  })
})
