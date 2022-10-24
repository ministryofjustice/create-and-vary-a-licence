import { Request, Response } from 'express'

import EditQuestionRoutes from './editQuestion'
import LicenceService from '../../../services/licenceService'

const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Edit Licence Question', () => {
  const handler = new EditQuestionRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
      },
      user: {
        username: 'joebloggs',
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        licence: {},
        user: {
          username: 'joebloggs',
          displayName: 'Joe Bloggs',
        },
      },
    } as unknown as Response

    licenceService.updateStatus = jest.fn()
  })

  describe('GET', () => {
    it('should redirect if not in the correct status', async () => {
      res.locals.licence.statusCode = 'ACTIVE'
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith(`/licence/create/id/1/check-your-answers`)
    })

    it('should render view', async () => {
      res.locals.licence.statusCode = 'APPROVED'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/editQuestion')
    })
  })

  describe('POST', () => {
    it('should update status to IN_PROGRESS and redirect when answer is YES', async () => {
      req = {
        ...req,
        body: {
          answer: 'Yes',
        },
      } as unknown as Request
      await handler.POST(req, res)
      expect(licenceService.updateStatus).toHaveBeenCalledWith('1', 'IN_PROGRESS', {
        username: 'joebloggs',
        displayName: 'Joe Bloggs',
      })
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })

    it('should not update status and should redirect when answer is NO', async () => {
      req = {
        ...req,
        body: {
          answer: 'No',
        },
      } as unknown as Request
      await handler.POST(req, res)
      expect(licenceService.updateStatus).not.toBeCalled()
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
