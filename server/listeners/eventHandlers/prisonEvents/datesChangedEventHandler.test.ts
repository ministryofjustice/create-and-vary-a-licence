import moment from 'moment'
import { addDays, format } from 'date-fns'
import LicenceService from '../../../services/licenceService'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import PrisonerService from '../../../services/prisonerService'
import { PrisonApiPrisoner, PrisonEventMessage } from '../../../@types/prisonApiClientTypes'
import SentenceDatesChangedEventHandler from './datesChangedEventHandler'
import { Prisoner } from '../../../@types/prisonerSearchApiClientTypes'

const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>
const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>

jest.mock('../../../services/licenceService')
jest.mock('../../../services/prisonerService')

const prisoner = {
  sentenceDetail: {
    conditionalReleaseDate: '2022-09-09',
    sentenceStartDate: '2021-09-09',
    sentenceExpiryDate: '2023-09-09',
    licenceExpiryDate: '2023-09-09',
    topupSupervisionStartDate: '2023-09-09',
    topupSupervisionExpiryDate: '2024-09-09',
  },
} as PrisonApiPrisoner

beforeEach(() => {
  prisonerService.getPrisonerDetail.mockResolvedValue(prisoner)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Sentence dates changed event handler', () => {
  const handler = new SentenceDatesChangedEventHandler(licenceService, prisonerService)

  it('should use bookingId to get the nomisID, if the nomisId is not provided', async () => {
    const event = {
      bookingId: 1234,
    } as PrisonEventMessage

    prisonerService.searchPrisonersByBookingIds.mockResolvedValue([{ prisonerNumber: 'ABC123' } as Prisoner])

    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'APPROVED',
      } as LicenceSummary,
    ])

    await handler.handle(event)

    expect(prisonerService.getPrisonerDetail).toHaveBeenCalledWith('ABC123')
  })

  it('should not update sentence dates if the offender does not have a licence', async () => {
    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([])

    await handler.handle(event)

    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
      ['ABC123'],
      ['IN_PROGRESS', 'SUBMITTED', 'REJECTED', 'APPROVED']
    )
    expect(licenceService.updateSentenceDates).not.toHaveBeenCalled()
  })

  it('should update the sentence dates on the licence', async () => {
    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'SUBMITTED',
      } as LicenceSummary,
    ])

    await handler.handle(event)

    expect(licenceService.updateSentenceDates).toHaveBeenCalledWith('1', {
      conditionalReleaseDate: '09/09/2022',
      actualReleaseDate: undefined,
      sentenceStartDate: '09/09/2021',
      sentenceEndDate: '09/09/2023',
      licenceStartDate: '09/09/2022',
      licenceExpiryDate: '09/09/2023',
      topupSupervisionStartDate: '09/09/2023',
      topupSupervisionExpiryDate: '09/09/2024',
    })
  })

  it('should use conditional release override date', async () => {
    prisonerService.getPrisonerDetail.mockResolvedValue({
      ...prisoner,
      sentenceDetail: {
        ...prisoner.sentenceDetail,
        conditionalReleaseOverrideDate: '2022-09-10',
      },
    } as PrisonApiPrisoner)

    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'SUBMITTED',
      } as LicenceSummary,
    ])

    await handler.handle(event)

    expect(licenceService.updateSentenceDates).toHaveBeenCalledWith('1', {
      conditionalReleaseDate: '10/09/2022',
      actualReleaseDate: undefined,
      sentenceStartDate: '09/09/2021',
      sentenceEndDate: '09/09/2023',
      licenceStartDate: '10/09/2022',
      licenceExpiryDate: '09/09/2023',
      topupSupervisionStartDate: '09/09/2023',
      topupSupervisionExpiryDate: '09/09/2024',
    })
  })

  it('should use confirmed release date', async () => {
    prisonerService.getPrisonerDetail.mockResolvedValue({
      ...prisoner,
      sentenceDetail: {
        ...prisoner.sentenceDetail,
        confirmedReleaseDate: '2022-09-10',
      },
    } as PrisonApiPrisoner)

    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'SUBMITTED',
      } as LicenceSummary,
    ])

    await handler.handle(event)

    expect(licenceService.updateSentenceDates).toHaveBeenCalledWith('1', {
      conditionalReleaseDate: '09/09/2022',
      actualReleaseDate: '10/09/2022',
      sentenceStartDate: '09/09/2021',
      sentenceEndDate: '09/09/2023',
      licenceStartDate: '10/09/2022',
      licenceExpiryDate: '09/09/2023',
      topupSupervisionStartDate: '09/09/2023',
      topupSupervisionExpiryDate: '09/09/2024',
    })
  })

  it('should not update sentence dates if the offender is an IS91 case and has a CRD in the past', async () => {
    const is91Prisoner = {
      ...prisoner,
      legalStatus: 'IMMIGRATION_DETAINEE',
    } as PrisonApiPrisoner

    prisonerService.getPrisonerDetail.mockResolvedValue(is91Prisoner)

    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'SUBMITTED',
        actualReleaseDate: format(addDays(new Date(), -7), 'dd/MM/yyyy'),
      } as LicenceSummary,
    ])

    await handler.handle(event)

    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
      ['ABC123'],
      ['IN_PROGRESS', 'SUBMITTED', 'REJECTED', 'APPROVED']
    )
    expect(licenceService.updateSentenceDates).not.toHaveBeenCalled()
  })

  it('should not update sentence dates if the offender is an IS91 case and has a ARD of today', async () => {
    const is91Prisoner = {
      ...prisoner,
      legalStatus: 'IMMIGRATION_DETAINEE',
    } as PrisonApiPrisoner

    prisonerService.getPrisonerDetail.mockResolvedValue(is91Prisoner)

    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'SUBMITTED',
        actualReleaseDate: format(new Date(), 'dd/MM/yyyy'),
      } as LicenceSummary,
    ])

    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    await handler.handle(event)

    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
      ['ABC123'],
      ['IN_PROGRESS', 'SUBMITTED', 'REJECTED', 'APPROVED']
    )
    expect(licenceService.updateSentenceDates).not.toHaveBeenCalled()
  })

  it('should update the sentence dates if the offender is an IS91 case and has an ARD in the future', async () => {
    const is91Prisoner = {
      ...prisoner,
      legalStatus: 'IMMIGRATION_DETAINEE',
    } as PrisonApiPrisoner

    prisonerService.getPrisonerDetail.mockResolvedValue(is91Prisoner)

    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'SUBMITTED',
        actualReleaseDate: moment().add(1, 'weeks').format('YYYY-MM-DD'),
      } as LicenceSummary,
    ])

    await handler.handle(event)

    expect(licenceService.updateSentenceDates).toHaveBeenCalledWith('1', {
      conditionalReleaseDate: '09/09/2022',
      actualReleaseDate: undefined,
      sentenceStartDate: '09/09/2021',
      sentenceEndDate: '09/09/2023',
      licenceStartDate: '09/09/2022',
      licenceExpiryDate: '09/09/2023',
      topupSupervisionStartDate: '09/09/2023',
      topupSupervisionExpiryDate: '09/09/2024',
    })
  })

  it('should update the sentence dates if the offender is an IS91 case but it has no ARD', async () => {
    const is91Prisoner = {
      ...prisoner,
      legalStatus: 'IMMIGRATION_DETAINEE',
    } as PrisonApiPrisoner

    prisonerService.getPrisonerDetail.mockResolvedValue(is91Prisoner)

    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'SUBMITTED',
        actualReleaseDate: undefined,
      } as LicenceSummary,
    ])

    await handler.handle(event)

    expect(licenceService.updateSentenceDates).toHaveBeenCalledWith('1', {
      conditionalReleaseDate: '09/09/2022',
      actualReleaseDate: undefined,
      sentenceStartDate: '09/09/2021',
      sentenceEndDate: '09/09/2023',
      licenceStartDate: '09/09/2022',
      licenceExpiryDate: '09/09/2023',
      topupSupervisionStartDate: '09/09/2023',
      topupSupervisionExpiryDate: '09/09/2024',
    })
  })
})
