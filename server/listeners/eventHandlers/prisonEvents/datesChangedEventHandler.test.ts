import { addDays, format, subDays } from 'date-fns'
import LicenceService from '../../../services/licenceService'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import PrisonerService from '../../../services/prisonerService'
import { PrisonApiPrisoner } from '../../../@types/prisonApiClientTypes'
import SentenceDatesChangedEventHandler from './datesChangedEventHandler'
import { Prisoner } from '../../../@types/prisonerSearchApiClientTypes'
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
    homeDetentionCurfewActualDate: '2023-09-09',
    homeDetentionCurfewEndDate: '2023-09-10',
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

    licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue(null)
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

    licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue(null)
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([])

    await handler.handle(event)

    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
      ['ABC123'],
      ['IN_PROGRESS', 'SUBMITTED', 'REJECTED', 'APPROVED', 'TIMED_OUT'],
    )
    expect(licenceService.updateSentenceDates).not.toHaveBeenCalled()
  })

  it('should update the sentence dates on all pre-active licences', async () => {
    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue(null)
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
      {
        licenceId: 5,
        licenceStatus: 'TIMED_OUT',
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
      postRecallReleaseDate: undefined,
      homeDetentionCurfewActualDate: '09/09/2023',
      homeDetentionCurfewEndDate: '10/09/2023',
    } as Record<string, string>

    expect(licenceService.updateSentenceDates).toHaveBeenCalledWith('1', newDates)
    expect(licenceService.updateSentenceDates).toHaveBeenCalledWith('2', newDates)
    expect(licenceService.updateSentenceDates).toHaveBeenCalledWith('3', newDates)
    expect(licenceService.updateSentenceDates).toHaveBeenCalledWith('4', newDates)
    expect(licenceService.updateSentenceDates).toHaveBeenCalledWith('5', newDates)
  })

  it('should use conditional release override date, sentence expiry override date, licence expiry override date, topup supervision expiry override date, post recall release override date', async () => {
    prisonerService.getPrisonerDetail.mockResolvedValue({
      ...prisoner,
      sentenceDetail: {
        ...prisoner.sentenceDetail,
        conditionalReleaseOverrideDate: '2022-09-10',
        sentenceExpiryOverrideDate: '2022-09-11',
        licenceExpiryOverrideDate: '2022-09-12',
        topupSupervisionExpiryOverrideDate: '2022-09-13',
        postRecallReleaseOverrideDate: '2024-05-02',
      },
    } as PrisonApiPrisoner)

    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue(null)
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
      postRecallReleaseDate: '02/05/2024',
      homeDetentionCurfewActualDate: '09/09/2023',
      homeDetentionCurfewEndDate: '10/09/2023',
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
        postRecallReleaseOverrideDate: null,
      },
    } as PrisonApiPrisoner)

    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue(null)
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
      postRecallReleaseDate: undefined,
      homeDetentionCurfewActualDate: '09/09/2023',
      homeDetentionCurfewEndDate: '10/09/2023',
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

    licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue(null)
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
      homeDetentionCurfewActualDate: '09/09/2023',
      homeDetentionCurfewEndDate: '10/09/2023',
    })
  })

  it('should not deactivate an active licence if the sentence start date is before the licence CRD', async () => {
    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue({
      licenceId: 1,
      licenceStatus: 'ACTIVE',
      conditionalReleaseDate: '20/02/2022',
    } as LicenceSummary)

    await handler.handle(event)
    expect(licenceService.updateSentenceDates).not.toHaveBeenCalled()
    expect(licenceService.deactivateActiveAndVariationLicences).not.toHaveBeenCalled()
  })

  it('should deactivate an active licence if the sentence start date is after the licence CRD', async () => {
    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue({
      licenceId: 1,
      licenceStatus: 'ACTIVE',
      conditionalReleaseDate: '08/09/2021',
    } as LicenceSummary)

    await handler.handle(event)
    expect(licenceService.updateSentenceDates).not.toHaveBeenCalled()
    expect(licenceService.deactivateActiveAndVariationLicences).toHaveBeenCalledWith(1, 'RESENTENCED')
  })

  describe('With a future PRRD', () => {
    const prisoner = {
      sentenceDetail: {
        conditionalReleaseDate: '2022-09-09',
        sentenceStartDate: '2021-09-09',
        sentenceExpiryDate: '2023-09-09',
        licenceExpiryDate: '2023-09-09',
        topupSupervisionStartDate: '2023-09-09',
        topupSupervisionExpiryDate: '2024-09-09',
        postRecallReleaseDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
      },
    } as PrisonApiPrisoner

    beforeEach(() => {
      prisonerService.getPrisonerDetail.mockResolvedValue(prisoner)
    })

    it('should deactivate an active licence if the PRRD has changed and is in the future', async () => {
      const event = {
        offenderIdDisplay: 'ABC123',
      } as PrisonEventMessage

      licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue({
        licenceId: 1,
        licenceStatus: 'ACTIVE',
        conditionalReleaseDate: '08/09/2022',
        postRecallReleaseDate: '01/01/2022',
      } as LicenceSummary)

      await handler.handle(event)
      expect(licenceService.updateSentenceDates).not.toHaveBeenCalled()
      expect(licenceService.deactivateActiveAndVariationLicences).toHaveBeenCalledWith(1, 'RECALLED')
    })

    it('should deactivate an active licence if the licence does not have an existing PRRD and is in the future', async () => {
      const event = {
        offenderIdDisplay: 'ABC123',
      } as PrisonEventMessage

      licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue({
        licenceId: 1,
        licenceStatus: 'ACTIVE',
        conditionalReleaseDate: '08/09/2022',
      } as LicenceSummary)

      await handler.handle(event)
      expect(licenceService.updateSentenceDates).not.toHaveBeenCalled()
      expect(licenceService.deactivateActiveAndVariationLicences).toHaveBeenCalledWith(1, 'RECALLED')
    })

    it('should not deactivate an active licence with a future PRRD if the PRRD has not changed', async () => {
      const event = {
        offenderIdDisplay: 'ABC123',
      } as PrisonEventMessage

      licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue({
        licenceId: 1,
        licenceStatus: 'ACTIVE',
        conditionalReleaseDate: '08/09/2022',
        postRecallReleaseDate: format(addDays(new Date(), 2), 'dd/MM/yyyy'),
      } as LicenceSummary)

      await handler.handle(event)
      expect(licenceService.updateSentenceDates).not.toHaveBeenCalled()
      expect(licenceService.deactivateActiveAndVariationLicences).not.toHaveBeenCalled()
    })
  })

  it('should not deactive an active licence if the new PRRD is in the past', async () => {
    const prisoner = {
      sentenceDetail: {
        conditionalReleaseDate: '2022-09-09',
        sentenceStartDate: '2021-09-09',
        sentenceExpiryDate: '2023-09-09',
        licenceExpiryDate: '2023-09-09',
        topupSupervisionStartDate: '2023-09-09',
        topupSupervisionExpiryDate: '2024-09-09',
        postRecallReleaseDate: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
      },
    } as PrisonApiPrisoner
    prisonerService.getPrisonerDetail.mockResolvedValue(prisoner)

    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue({
      licenceId: 1,
      licenceStatus: 'ACTIVE',
      conditionalReleaseDate: '08/09/2022',
      postRecallReleaseDate: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
    } as LicenceSummary)

    await handler.handle(event)
    expect(licenceService.updateSentenceDates).not.toHaveBeenCalled()
    expect(licenceService.deactivateActiveAndVariationLicences).not.toHaveBeenCalled()
  })

  it('should not deactive an active licence if the new PRRD is today', async () => {
    const prisoner = {
      sentenceDetail: {
        conditionalReleaseDate: '2022-09-09',
        sentenceStartDate: '2021-09-09',
        sentenceExpiryDate: '2023-09-09',
        licenceExpiryDate: '2023-09-09',
        topupSupervisionStartDate: '2023-09-09',
        topupSupervisionExpiryDate: '2024-09-09',
        postRecallReleaseDate: format(new Date(), 'yyyy-MM-dd'),
      },
    } as PrisonApiPrisoner
    prisonerService.getPrisonerDetail.mockResolvedValue(prisoner)

    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEventMessage

    licenceService.getLatestLicenceByNomisIdsAndStatus.mockResolvedValue({
      licenceId: 1,
      licenceStatus: 'ACTIVE',
      conditionalReleaseDate: '08/09/2022',
      postRecallReleaseDate: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
    } as LicenceSummary)

    await handler.handle(event)
    expect(licenceService.updateSentenceDates).not.toHaveBeenCalled()
    expect(licenceService.deactivateActiveAndVariationLicences).not.toHaveBeenCalled()
  })
})
