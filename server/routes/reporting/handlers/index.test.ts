import { Request, Response } from 'express'
import DprHomeRoutes from '.'
import { ReportDefinitionSummary } from '../../../@types/express'

describe('Route Handlers - DPR Reports', () => {
  const handler = new DprHomeRoutes()
  let req: Request
  let res: Response

  beforeEach(() => {
    res = {
      locals: {},
      render: jest.fn(),
    } as unknown as Response
  })

  describe('GET', () => {
    it('Should render the correct view', async () => {
      const definitions = [
        { id: 'some-report', variants: [{ id: 'some-variant', name: 'some-name' }] },
      ] as ReportDefinitionSummary[]

      res.locals.definitions = definitions
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/reports/index', { definitions })
    })
  })
})
