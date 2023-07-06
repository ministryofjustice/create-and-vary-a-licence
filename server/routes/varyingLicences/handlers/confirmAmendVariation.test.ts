import { Request, Response } from 'express'

import LicenceService from '../../../services/licenceService'
import ConfirmAmendVariationRoutes from './confirmAmendVariation'
import LicenceStatus from '../../../enumeration/licenceStatus'
import ConditionService from '../../../services/conditionService'
import { Licence } from '../../../@types/licenceApiClientTypes'
import ConditionFormatter from '../../../services/conditionFormatter'
import { LicenceApiClient } from '../../../data'

jest.mock('../../../data/licenceApiClient')
jest.mock('../../../services/licenceService')
jest.mock('../../../services/conditionService')

const conditionFormatter = new ConditionFormatter()
const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
const conditionService = new ConditionService(licenceApiClient, conditionFormatter) as jest.Mocked<ConditionService>
const licenceService = new LicenceService(null, null, null, conditionService) as jest.Mocked<LicenceService>

describe('Route Handlers - Vary Licence - Confirm amend variation', () => {
  const handler = new ConfirmAmendVariationRoutes(licenceApiClient, licenceService, conditionService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
      },
      body: {},
      query: {},
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
        licence: {
          version: '1.1',
        },
      },
    } as unknown as Response
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/confirmAmendVariation')
    })
  })

  describe('POST', () => {
    it('should update status to in progress when answer is yes and the licence version is up to date', async () => {
      req.body = { answer: 'Yes' }
      licenceApiClient.getParentLicenceOrSelf.mockResolvedValue({ version: '2.0' } as Licence)
      conditionService.getPolicyVersion.mockResolvedValue('2.0')
      await handler.POST(req, res)

      expect(licenceService.updateStatus).toHaveBeenCalledWith('1', LicenceStatus.VARIATION_IN_PROGRESS, {
        username: 'joebloggs',
      })
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })

    it('should update status to in progress and update the standard conditions when answer is yes and the licence version is out of date', async () => {
      req.body = { answer: 'Yes' }
      licenceApiClient.getParentLicenceOrSelf.mockResolvedValue({ version: '1.0' } as Licence)
      conditionService.getPolicyVersion.mockResolvedValue('2.0')
      conditionService.getStandardConditions.mockResolvedValue([])
      await handler.POST(req, res)

      expect(licenceService.updateStatus).toHaveBeenCalledWith('1', LicenceStatus.VARIATION_IN_PROGRESS, {
        username: 'joebloggs',
      })

      expect(licenceService.updateStandardConditions).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })

    it('should redirect to view variation when answer is no', async () => {
      req.body = { answer: 'No' }
      await handler.POST(req, res)

      expect(licenceService.updateStatus).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/view')
    })
  })
})
