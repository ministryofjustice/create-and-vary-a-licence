import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceOverrideService from '../../../services/licenceOverrideService'
import type { Licence } from '../../../@types/licenceApiClientTypes'
import OffenderLicenceDatesRoutes from './offenderLicenceDates'
import { dateStringToSimpleDate } from '../../../utils/utils'
import LicenceKind from '../../../enumeration/LicenceKind'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const overrideService = new LicenceOverrideService(null) as jest.Mocked<LicenceOverrideService>
jest.mock('../../../services/licenceService')
jest.mock('../../../services/licenceOverrideService')

describe('Route handlers - Licence dates override', () => {
  const handler = new OffenderLicenceDatesRoutes(licenceService, overrideService)
  let req: Request
  let res: Response

  const licenceDates = {
    conditionalReleaseDate: '01/01/2022',
    actualReleaseDate: '02/01/2022',
    sentenceStartDate: '03/01/2022',
    sentenceEndDate: '04/01/2022',
    licenceExpiryDate: '05/01/2022',
    topupSupervisionStartDate: '06/01/2022',
    topupSupervisionExpiryDate: '07/01/2022',
    postRecallReleaseDate: '24/06/2026',
  }

  const licenceSimpleDates = {
    crd: dateStringToSimpleDate(licenceDates.conditionalReleaseDate),
    ard: dateStringToSimpleDate(licenceDates.actualReleaseDate),
    ssd: dateStringToSimpleDate(licenceDates.sentenceStartDate),
    sed: dateStringToSimpleDate(licenceDates.sentenceEndDate),
    led: dateStringToSimpleDate(licenceDates.licenceExpiryDate),
    tussd: dateStringToSimpleDate(licenceDates.topupSupervisionStartDate),
    tused: dateStringToSimpleDate(licenceDates.topupSupervisionExpiryDate),
    prrd: dateStringToSimpleDate(licenceDates.postRecallReleaseDate),
  }

  const hdcLicenceDates = {
    homeDetentionCurfewActualDate: '01/01/2022',
    homeDetentionCurfewEndDate: '05/01/2022',
    ...licenceDates,
  }

  const hdcLicenceSimpleDates = {
    hdcad: dateStringToSimpleDate(hdcLicenceDates.homeDetentionCurfewActualDate),
    hdcEndDate: dateStringToSimpleDate(hdcLicenceDates.homeDetentionCurfewEndDate),
    ...licenceSimpleDates,
  }

  const licence = {
    id: 1,
    ...licenceDates,
  } as Licence

  const hdcLicence = {
    id: 1,
    kind: LicenceKind.HDC,
    ...hdcLicenceDates,
  } as Licence

  beforeEach(() => {
    jest.resetAllMocks()
    res = {
      locals: {
        user: { username: 'bob' },
      },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
    req = {} as Request
  })

  describe('GET', () => {
    it('Renders the override licence dates view', async () => {
      licenceService.getLicence.mockResolvedValue(licence)

      req.params = {
        licenceId: '1',
        nomsId: 'ABC123',
      }

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/support/offenderLicenceDates', {
        licence,
        licenceDates: licenceSimpleDates,
      })
    })

    it('Renders the override HDC licence dates view', async () => {
      licenceService.getLicence.mockResolvedValue(hdcLicence)

      req.params = {
        licenceId: '1',
        nomsId: 'ABC123',
      }

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/support/offenderLicenceDates', {
        licence: hdcLicence,
        licenceDates: hdcLicenceSimpleDates,
      })
    })
  })

  describe('POST', () => {
    it('Update licence dates', async () => {
      licenceService.getLicence.mockResolvedValue(licence)

      const dateChangeReason = 'a reason'
      req.params = {
        licenceId: '1',
        nomsId: 'ABC123',
      }
      req.body = { dateChangeReason, ...licenceSimpleDates }

      await handler.POST(req, res)

      expect(overrideService.overrideDates).toHaveBeenCalledWith(
        1,
        { ...licenceDates, reason: dateChangeReason },
        {
          username: 'bob',
        },
      )

      expect(res.redirect).toHaveBeenCalledWith(`/support/offender/ABC123/licences`)
    })

    it('Update licence dates fails if no reason is given', async () => {
      licenceService.getLicence.mockResolvedValue(licence)

      req.params = {
        licenceId: '1',
        nomsId: 'ABC123',
      }
      req.body = { ...licenceSimpleDates }

      await handler.POST(req, res)

      expect(overrideService.overrideDates).toHaveBeenCalledTimes(0)
      expect(res.render).toHaveBeenCalledWith('pages/support/offenderLicenceDates', {
        licence,
        licenceDates: licenceSimpleDates,
      })
    })
  })
})
