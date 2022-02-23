import LicenceService from '../../../services/licenceService'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import LicenceStatus from '../../../enumeration/licenceStatus'
import PrisonerService from '../../../services/prisonerService'
import { PrisonApiPrisoner, PrisonEvent } from '../../../@types/prisonApiClientTypes'
import SentenceDatesChangedEventHandler from './sentenceDatesChangedEventHandler'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>

jest.mock('../../../services/licenceService')
jest.mock('../../../services/prisonerService')

const prisoner = {
  sentenceDetail: {
    conditionalReleaseDate: '2022-09-09',
    sentenceStartDate: '2021-09-09',
    effectiveSentenceEndDate: '2023-09-09',
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

  it('should not update sentence dates if the offender does not have a licence', async () => {
    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEvent
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([])

    await handler.handle(event)

    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
      ['ABC123'],
      ['IN_PROGRESS', 'SUBMITTED', 'REJECTED', 'APPROVED']
    )
    expect(licenceService.updateSentenceDates).not.toHaveBeenCalled()
  })

  it('should update the licence to IN_PROGRESS', async () => {
    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEvent
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        licenceId: 1,
        licenceStatus: 'APPROVED',
      } as LicenceSummary,
    ])

    await handler.handle(event)

    expect(licenceService.updateStatus).toHaveBeenCalledWith('1', LicenceStatus.IN_PROGRESS)
  })

  it('should update the sentence dates on the licence', async () => {
    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEvent
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
    } as PrisonEvent
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

  it('should use release date', async () => {
    prisonerService.getPrisonerDetail.mockResolvedValue({
      ...prisoner,
      sentenceDetail: {
        ...prisoner.sentenceDetail,
        releaseDate: '2022-09-10',
      },
    } as PrisonApiPrisoner)

    const event = {
      offenderIdDisplay: 'ABC123',
    } as PrisonEvent
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
})
