import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceOverrideService from '../../../services/licenceOverrideService'
import OffenderLicenceStatusRoutes from './offenderLicenceStatus'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import statusConfig from '../../../licences/licenceStatus'
import { User } from '../../../@types/CvlUserDetails'

const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>
const overrideService = new LicenceOverrideService(null) as jest.Mocked<LicenceOverrideService>
jest.mock('../../../services/licenceService')
jest.mock('../../../services/licenceOverrideService')

describe('Route Handlers - Licence Status Override', () => {
  const handler = new OffenderLicenceStatusRoutes(licenceService, overrideService)
  let req: Request
  let res: Response

  const mockLicences = [
    {
      licenceId: 1,
      licenceStatus: LicenceStatus.IN_PROGRESS,
    } as LicenceSummary,
    {
      licenceId: 2,
      licenceStatus: LicenceStatus.INACTIVE,
    } as LicenceSummary,
    {
      licenceId: 3,
      licenceStatus: LicenceStatus.ACTIVE,
    } as LicenceSummary,
  ]

  const user = { username: 'Test User' } as User

  beforeEach(() => {
    jest.resetAllMocks()
    res = {
      locals: {
        user,
      },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
    req = {} as Request
  })

  describe('GET', () => {
    it('Returns valid list of status codes', async () => {
      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue(mockLicences)

      req.params = {
        nomsId: 'ABC123',
        licenceId: '1',
      }

      await handler.GET(req, res)

      expect(res.render).toBeCalledWith('pages/support/offenderLicenceStatus', {
        availableStatusCodes: [
          'APPROVED',
          'INACTIVE',
          'NOT_STARTED',
          'RECALLED',
          'REJECTED',
          'SUBMITTED',
          'VARIATION_APPROVED',
          'VARIATION_IN_PROGRESS',
          'VARIATION_REJECTED',
          'VARIATION_SUBMITTED',
        ],
        currentStatus: 'IN_PROGRESS',
        licenceId: '1',
        statusConfig,
      })
    })
  })

  describe('POST', () => {
    it('Update licence status from IN_PROGRESS to APPROVED', async () => {
      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue(mockLicences)

      req.params = {
        nomsId: 'ABC123',
        licenceId: '1',
      }

      const reason = 'Test Reason'

      expect(overrideService.overrideStatusCode).toHaveBeenCalledWith(
        1,
        LicenceStatus.APPROVED.toString(),
        reason,
        user
      )
      await handler.POST(req, res)

      expect(overrideService.overrideStatusCode).toHaveBeenCalledWith(1, LicenceStatus.APPROVED.toString(), reason)

      expect(res.redirect).toHaveBeenCalledWith(`/support/offender/ABC123/licences`)
    })

    it('Update licence status from IN_PROGRESS fails if no reason is given', async () => {
      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue(mockLicences)

      req.params = {
        nomsId: 'ABC123',
        licenceId: '1',
      }

      req.body = { status: LicenceStatus.APPROVED.toString(), statusChangeReason: null }

      await handler.POST(req, res)

      expect(overrideService.overrideStatusCode).toBeCalledTimes(0)

      expect(res.render).toHaveBeenCalledWith('pages/support/offenderLicenceStatus', {
        availableStatusCodes: [
          'APPROVED',
          'INACTIVE',
          'NOT_STARTED',
          'RECALLED',
          'REJECTED',
          'SUBMITTED',
          'VARIATION_APPROVED',
          'VARIATION_IN_PROGRESS',
          'VARIATION_REJECTED',
          'VARIATION_SUBMITTED',
        ],
        status: 'APPROVED',
        statusChangeReason: null,
        statusCodeError: false,
        statusReasonError: true,
        currentStatus: 'IN_PROGRESS',
        licenceId: '1',
        statusConfig,
      })
    })

    it('Update licence status from IN_PROGRESS fails if no status is given', async () => {
      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue(mockLicences)

      req.params = {
        nomsId: 'ABC123',
        licenceId: '1',
      }

      const reason = 'Test Reason'

      req.body = { status: null, statusChangeReason: reason }

      await handler.POST(req, res)

      expect(overrideService.overrideStatusCode).toBeCalledTimes(0)

      expect(res.render).toHaveBeenCalledWith('pages/support/offenderLicenceStatus', {
        availableStatusCodes: [
          'APPROVED',
          'INACTIVE',
          'NOT_STARTED',
          'RECALLED',
          'REJECTED',
          'SUBMITTED',
          'VARIATION_APPROVED',
          'VARIATION_IN_PROGRESS',
          'VARIATION_REJECTED',
          'VARIATION_SUBMITTED',
        ],
        status: null,
        statusChangeReason: reason,
        statusCodeError: true,
        statusReasonError: false,
        currentStatus: 'IN_PROGRESS',
        licenceId: '1',
        statusConfig,
      })
    })

    it('Update licence status from IN_PROGRESS fails if no status and reason is given', async () => {
      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue(mockLicences)

      req.params = {
        nomsId: 'ABC123',
        licenceId: '1',
      }

      req.body = { status: null, statusChangeReason: null }

      await handler.POST(req, res)

      expect(overrideService.overrideStatusCode).toBeCalledTimes(0)

      expect(res.render).toHaveBeenCalledWith('pages/support/offenderLicenceStatus', {
        availableStatusCodes: [
          'APPROVED',
          'INACTIVE',
          'NOT_STARTED',
          'RECALLED',
          'REJECTED',
          'SUBMITTED',
          'VARIATION_APPROVED',
          'VARIATION_IN_PROGRESS',
          'VARIATION_REJECTED',
          'VARIATION_SUBMITTED',
        ],
        status: null,
        statusChangeReason: null,
        statusCodeError: true,
        statusReasonError: true,
        currentStatus: 'IN_PROGRESS',
        licenceId: '1',
        statusConfig,
      })
    })
  })
})
