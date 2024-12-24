import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceOverrideService from '../../../services/licenceOverrideService'
import type { Licence } from '../../../@types/licenceApiClientTypes'
import OffenderLicenceTypeRoutes from './offenderLicenceType'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const overrideService = new LicenceOverrideService(null) as jest.Mocked<LicenceOverrideService>
jest.mock('../../../services/licenceService')
jest.mock('../../../services/licenceOverrideService')

describe('Route handlers - Licence dates override', () => {
  const handler = new OffenderLicenceTypeRoutes(licenceService, overrideService)
  let req: Request
  let res: Response

  const licence = {
    id: 1,
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
    req = {
      flash: jest.fn(),
    } as unknown as Request
  })

  describe('GET', () => {
    it('Renders the override licence dates view', async () => {
      licenceService.getLicence.mockResolvedValue(licence)

      req.params = {
        licenceId: '1',
        nomsId: 'ABC123',
      }

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/support/offenderLicenceType', {
        licence,
      })
    })
  })

  describe('POST', () => {
    it('Update licence type', async () => {
      licenceService.getLicence.mockResolvedValue(licence)

      const reason = 'a reason'
      const licenceType = 'PSS'
      req.params = {
        licenceId: '1',
        nomsId: 'ABC123',
      }
      req.body = { licenceType, reason }

      await handler.POST(req, res)

      expect(overrideService.overrideType).toHaveBeenCalledWith(
        1,
        { licenceType, reason },
        {
          username: 'bob',
        },
      )

      expect(res.redirect).toHaveBeenCalledWith(`/support/offender/ABC123/licences`)
    })

    it('redirect back to page when api reports issues', async () => {
      licenceService.getLicence.mockResolvedValue(licence)
      overrideService.overrideType.mockResolvedValue({
        LED: 'IS_PRESENT',
        TUSED: 'IS_IN_PAST',
      })

      const reason = 'a reason'
      const licenceType = 'PSS'
      req.params = {
        licenceId: '1',
        nomsId: 'ABC123',
      }
      req.body = { licenceType, reason }

      await handler.POST(req, res)

      expect(overrideService.overrideType).toHaveBeenCalledWith(
        1,
        { licenceType, reason },
        {
          username: 'bob',
        },
      )
      expect(req.flash).toHaveBeenCalledWith(
        'validationErrors',
        JSON.stringify([
          { field: '', message: 'LED Is present' },
          { field: '', message: 'TUSED Is in past' },
        ]),
      )
      expect(req.flash).toHaveBeenCalledWith(
        'formResponses',
        JSON.stringify({ licenceType: 'PSS', reason: 'a reason' }),
      )

      expect(res.redirect).toHaveBeenCalledWith(`/support/offender/ABC123/licence/1/type`)
    })
  })
})
