import { PrisonApiPrisoner } from '../../../@types/prisonApiClientTypes'
import { Prisoner } from '../../../@types/prisonerSearchApiClientTypes'
import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'
import OffenderDetailsChangedEventHandler from './offenderDetailsChangedEventHandler'
import { PrisonEventMessage } from '../../../@types/events'

const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>
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

  it('should use bookingId to get the nomisID, if the nomisId is not provided', async () => {
    const event = {
      bookingId: 1234,
    } as PrisonEventMessage

    prisonerService.searchPrisonersByBookingIds.mockResolvedValue([{ prisonerNumber: 'ABC123' } as Prisoner])

    await handler.handle(event)

    expect(prisonerService.getPrisonerDetail).toHaveBeenCalledWith('ABC123')
  })

  it('should use the nomisId if it is provided in the event', async () => {
    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    await handler.handle(event)

    expect(prisonerService.getPrisonerDetail).toHaveBeenCalledWith('ABC123')
  })

  it('should call for the offender details to be updated if the offender is found', async () => {
    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

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
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    await handler.handle(event)

    expect(licenceService.updateOffenderDetails).not.toHaveBeenCalled()
  })
})
