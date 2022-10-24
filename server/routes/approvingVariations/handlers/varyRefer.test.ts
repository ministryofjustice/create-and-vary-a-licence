import { Request, Response } from 'express'

import VaryReferRoutes from './varyRefer'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { VariedConditions } from '../../../utils/licenceComparator'

const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>
const username = 'joebloggs'
const displayName = 'Joe Bloggs'

jest.mock('../../../services/licenceService')

describe('Route - refer a licence variation', () => {
  const handler = new VaryReferRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      body: {
        licenceId: '1',
      },
    } as unknown as Request
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('should render a page to request reasons for referral', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username, displayName },
          licence: {
            id: 1,
            statusCode: LicenceStatus.VARIATION_SUBMITTED,
          },
        },
      } as unknown as Response

      licenceService.compareVariationToOriginal.mockResolvedValue({
        licenceConditionsAdded: [],
      } as VariedConditions)

      await handler.GET(req, res)

      expect(licenceService.compareVariationToOriginal).toHaveBeenCalledWith(
        { id: 1, statusCode: LicenceStatus.VARIATION_SUBMITTED },
        { username, displayName }
      )

      expect(res.render).toHaveBeenCalledWith('pages/vary-approve/request-changes', {
        conditionComparison: {
          licenceConditionsAdded: [],
        },
      })
    })

    it('should redirect to the variation approvals list if not in status VARIATION_SUBMITTED', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username, displayName },
          licence: {
            id: 1,
            statusCode: LicenceStatus.VARIATION_APPROVED,
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/vary-approve/list')
    })
  })

  describe('POST', () => {
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: { user: { username, displayName } },
    } as unknown as Response

    const expectedRequest = { reasonForReferral: 'reason' }

    it('should refer a licence variation', async () => {
      req = {
        params: {
          licenceId: '1',
        },
        body: expectedRequest,
      } as unknown as Request

      await handler.POST(req, res)

      expect(licenceService.referVariation).toHaveBeenCalledWith('1', expectedRequest, res.locals.user)
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary-approve/id/1/refer-confirm')
    })
  })
})
