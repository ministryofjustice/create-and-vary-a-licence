import { Request, Response } from 'express'
import OtherAgenciesRoutes from './otherAgencies'

jest.mock('../../../services/licenceService')
jest.mock('../../../services/conditionService')

describe('Other agencies', () => {
  const handler = new OtherAgenciesRoutes()
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        licence: {
          id: '1',
        },
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/otherAgencies', {})
    })
  })
})
