import { Request, Response } from 'express'
import RefusedInterruptHandler from './refusedInterruptHandler'

describe('Route Handlers - Create Licence - Refused interrupt', () => {
  const handler = new RefusedInterruptHandler()

  it.each(['/licence/create/caseload?view=team', undefined])(
    'should render the refused interrupt with return link %s',
    returnToCase => {
      const req = {
        params: { licenceId: '123' },
        session: { returnToCase },
      } as unknown as Request
      const res = { render: jest.fn() } as unknown as Response

      handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/create/refusedInterrupt', {
        backLink: returnToCase || '/licence/create/caseload',
        toCheckYourAnswer: '/licence/create/id/123/check-your-answers',
      })
    },
  )
})
