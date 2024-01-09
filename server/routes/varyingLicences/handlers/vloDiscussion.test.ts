import { Request, Response } from 'express'
import { Licence } from '../../../@types/licenceApiClientTypes'
import ConditionService from '../../../services/conditionService'

import LicenceService from '../../../services/licenceService'
import VloDiscussionRoutes from './vloDiscussion'

jest.mock('../../../services/licenceService')
jest.mock('../../../services/conditionService')

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const licenceService = new LicenceService(null, conditionService) as jest.Mocked<LicenceService>

describe('Route Handlers - Vary Licence - Vlo discussion', () => {
  const handler = new VloDiscussionRoutes(licenceService, conditionService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
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
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/vloDiscussion')
    })
  })

  describe('POST', () => {
    it('should save response and redirect to the check your answers page if the licence version is up to date', async () => {
      req.body = { answer: 'Yes' }
      licenceService.getParentLicenceOrSelf.mockResolvedValue({ version: '2.0' } as Licence)
      conditionService.getPolicyVersion.mockResolvedValue('2.0')
      await handler.POST(req, res)

      expect(licenceService.updateVloDiscussion).toHaveBeenCalledWith(
        1,
        { vloDiscussion: 'Yes' },
        { username: 'joebloggs' }
      )
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })

    it('should save response and redirect to the policy changes page if the licence version is up to date', async () => {
      req.body = { answer: 'Yes' }
      licenceService.getParentLicenceOrSelf.mockResolvedValue({ version: '1.0' } as Licence)
      conditionService.getPolicyVersion.mockResolvedValue('2.0')
      await handler.POST(req, res)

      expect(licenceService.updateVloDiscussion).toHaveBeenCalledWith(
        1,
        { vloDiscussion: 'Yes' },
        { username: 'joebloggs' }
      )
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/policy-changes')
    })
  })
})
