import { DomainEventMessage } from '../../../@types/events'
import { PrisonApiPrisoner } from '../../../@types/prisonApiClientTypes'
import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'
import OffenderDetailsChangedEventHandler from './offenderDetailsChangedEventHandler'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>

jest.mock('../../../services/licenceService')
jest.mock('../../../services/prisonerService')

const prisoner = {
  firstName: 'FIRST_NAME',
  middleName: 'MIDDLE_NAME_1 MIDDLE_NAME_2',
  lastName: 'LAST_NAME',
  dateOfBirth: '1970-01-01',
} as PrisonApiPrisoner

beforeEach(() => {
  prisonerService.getPrisonerDetail.mockResolvedValue(prisoner)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('offenderDetailsChangedEventHandler', () => {
  const handler = new OffenderDetailsChangedEventHandler(licenceService, prisonerService)

  it('should fetch the updated prison details using the NOMIS id provided in the event', async () => {
    const event = {
      additionalInformation: {
        nomsNumber: 'ABC123',
      },
    } as DomainEventMessage

    await handler.handle(event)

    expect(prisonerService.getPrisonerDetail).toHaveBeenCalledWith('ABC123')
  })

  it('should call for the offender details to be updated if the offender is found', async () => {
    const event = {
      additionalInformation: {
        nomsNumber: 'ABC123',
      },
    } as DomainEventMessage

    await handler.handle(event)

    expect(licenceService.updateOffenderDetails).toHaveBeenCalledWith('ABC123', {
      forename: 'First_name',
      middleNames: 'Middle_name_1 Middle_name_2',
      surname: 'Last_name',
      dateOfBirth: '01/01/1970',
    })
  })

  it('should not update if the prisoner cannot be found', async () => {
    prisonerService.getPrisonerDetail.mockResolvedValue(null)
    const event = {
      additionalInformation: {
        nomsNumber: 'ABC123',
      },
    } as DomainEventMessage

    await handler.handle(event)

    expect(licenceService.updateOffenderDetails).not.toHaveBeenCalled()
  })
})
