import LicenceService from '../../../services/licenceService'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import PrisonerService from '../../../services/prisonerService'
import { PrisonApiPrisoner } from '../../../@types/prisonApiClientTypes'
import SentenceDatesChangedEventHandler from './datesChangedEventHandler'
import { Prisoner } from '../../../@types/prisonerSearchApiClientTypes'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { PrisonEventMessage } from '../../../@types/events'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
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
  prisonerService.getPrisonerLatestSentenceStartDate.mockResolvedValue(new Date(2021, 8, 9))
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

    // first call to get active and variation licences
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValueOnce([])
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

  it('should update the sentence dates on all pre-active licences', async () => {
    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValueOnce([])
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'IN_PROGRESS',
      },
      {
        licenceId: 2,
        licenceStatus: 'SUBMITTED',
      },
      {
        licenceId: 3,
        licenceStatus: 'APPROVED',
      },
      {
        licenceId: 4,
        licenceStatus: 'REJECTED',
      },
    ] as LicenceSummary[])

    await handler.handle(event)

    const newDates = {
      conditionalReleaseDate: '09/09/2022',
      actualReleaseDate: undefined,
      sentenceStartDate: '09/09/2021',
      sentenceEndDate: '09/09/2023',
      licenceStartDate: '09/09/2022',
      licenceExpiryDate: '09/09/2023',
      topupSupervisionStartDate: '09/09/2023',
      topupSupervisionExpiryDate: '09/09/2024',
    } as Record<string, string>

    expect(licenceService.updateSentenceDates).toHaveBeenCalledWith('1', newDates)
    expect(licenceService.updateSentenceDates).toHaveBeenCalledWith('2', newDates)
    expect(licenceService.updateSentenceDates).toHaveBeenCalledWith('3', newDates)
    expect(licenceService.updateSentenceDates).toHaveBeenCalledWith('4', newDates)
  })

  it('should use conditional release override date, sentence expiry override date, licence expiry override date, topup supervision expiry override date', async () => {
    prisonerService.getPrisonerDetail.mockResolvedValue({
      ...prisoner,
      sentenceDetail: {
        ...prisoner.sentenceDetail,
        conditionalReleaseOverrideDate: '2022-09-10',
        sentenceExpiryOverrideDate: '2022-09-11',
        licenceExpiryOverrideDate: '2022-09-12',
        topupSupervisionExpiryOverrideDate: '2022-09-13',
      },
    } as PrisonApiPrisoner)

    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValueOnce([])
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
      sentenceEndDate: '11/09/2022',
      licenceStartDate: '10/09/2022',
      licenceExpiryDate: '12/09/2022',
      topupSupervisionStartDate: '09/09/2023',
      topupSupervisionExpiryDate: '13/09/2022',
    })
  })

  it('should not use override dates, if they are null', async () => {
    prisonerService.getPrisonerDetail.mockResolvedValue({
      ...prisoner,
      sentenceDetail: {
        ...prisoner.sentenceDetail,
        conditionalReleaseOverrideDate: null,
        sentenceExpiryOverrideDate: null,
        licenceExpiryOverrideDate: null,
        topupSupervisionExpiryOverrideDate: null,
      },
    } as PrisonApiPrisoner)

    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValueOnce([])
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

    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValueOnce([])
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

  it('should not deactivate an active licence if the sentence start date is before the licence CRD', async () => {
    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'ACTIVE',
        conditionalReleaseDate: '20/02/2022',
      } as LicenceSummary,
    ])

    await handler.handle(event)
    expect(licenceService.updateSentenceDates).not.toHaveBeenCalled()
    expect(licenceService.updateStatus).not.toHaveBeenCalled()
  })

  it('should deactivate an active licence if the sentence start date is after the licence CRD', async () => {
    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'ACTIVE',
        conditionalReleaseDate: '08/09/2021',
      } as LicenceSummary,
    ])

    await handler.handle(event)
    expect(licenceService.updateSentenceDates).not.toHaveBeenCalled()
    expect(licenceService.updateStatus).toHaveBeenCalledWith(1, LicenceStatus.INACTIVE)
  })
})
