import LicenceService from '../../../services/licenceService'
import { DomainEvent } from '../../../@types/events'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import LicenceStatus from '../../../enumeration/licenceStatus'
import TransferredEventHandler from './transferredEventHandler'
import PrisonerService from '../../../services/prisonerService'
import { PrisonInformation } from '../../../@types/prisonApiClientTypes'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>

jest.mock('../../../services/licenceService')
jest.mock('../../../services/prisonerService')

beforeEach(() => {
  prisonerService.getPrisonInformation.mockResolvedValue({
    formattedDescription: 'Pentonville (HMP)',
    phones: [
      {
        type: 'BUS',
        ext: '+44',
        number: '276 54545',
      },
    ],
  } as PrisonInformation)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Transferred event handler', () => {
  const handler = new TransferredEventHandler(licenceService, prisonerService)

  it('should skip the event if release reason is not TRANSFERRED', async () => {
    const event = {
      additionalInformation: {
        reason: 'ADMISSION',
      },
    } as DomainEvent

    await handler.handle(event)

    expect(licenceService.getLicencesByNomisIdsAndStatus).not.toHaveBeenCalled()
  })

  it('should not update prison information if the offender does not have a licence', async () => {
    const event = {
      additionalInformation: {
        reason: 'TRANSFERRED',
        nomsNumber: 'ABC1234',
      },
    } as DomainEvent
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([])

    await handler.handle(event)

    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
      ['ABC1234'],
      ['IN_PROGRESS', 'SUBMITTED', 'REJECTED', 'APPROVED']
    )
    expect(licenceService.updatePrisonInformation).not.toHaveBeenCalled()
  })

  it('should update the licence to SUBMITTED if the licence for the offender is APPROVED', async () => {
    const event = {
      additionalInformation: {
        reason: 'TRANSFERRED',
        nomsNumber: 'ABC1234',
        prisonId: 'PVI',
      },
    } as DomainEvent
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'APPROVED',
      } as LicenceSummary,
    ])

    await handler.handle(event)

    expect(licenceService.updateStatus).toHaveBeenCalledWith('1', LicenceStatus.SUBMITTED)
  })

  it('should not update the licence status if the licence for the offender is not APPROVED', async () => {
    const event = {
      additionalInformation: {
        reason: 'TRANSFERRED',
        nomsNumber: 'ABC1234',
        prisonId: 'PVI',
      },
    } as DomainEvent
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'SUBMITTED',
      } as LicenceSummary,
    ])

    await handler.handle(event)

    expect(licenceService.updateStatus).not.toHaveBeenCalled()
  })

  it('should update the prison information on the licence', async () => {
    const event = {
      additionalInformation: {
        reason: 'TRANSFERRED',
        nomsNumber: 'ABC1234',
        prisonId: 'PVI',
      },
    } as DomainEvent
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'SUBMITTED',
      } as LicenceSummary,
    ])

    await handler.handle(event)

    expect(licenceService.updatePrisonInformation).toHaveBeenCalledWith('1', {
      prisonCode: 'PVI',
      prisonDescription: 'Pentonville (HMP)',
      prisonTelephone: '+44 276 54545',
    })
  })
})
