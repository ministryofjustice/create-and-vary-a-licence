import { Request, Response } from 'express'

import ConfirmationRoutes from './confirmation'

describe('Route Handlers - Confirmation', () => {
  const handler = new ConfirmationRoutes()
  let res: Response

  beforeEach(() => {
    res = {
      render: jest.fn(),
      locals: {
        licence: {
          forename: 'Test',
          surname: 'Person',
          prisonDescription: `Leeds (HMP)`,
        },
      },
    } as unknown as Response
  })

  describe('Create Hard Stop Licence', () => {
    describe('GET', () => {
      it('should render correct return to caseload link for hard stop licence', async () => {
        res.locals.licence.kind = 'HARD_STOP'

        const reqWithEmptySession = {
          params: {
            licenceId: '1',
          },
          session: {},
          flash: jest.fn(),
        } as unknown as Request

        res.locals.licence.typeCode = 'AP'

        await handler.GET(reqWithEmptySession, res)
        expect(res.render).toHaveBeenCalledWith('pages/create/prisonCreated/confirmation', {
          titleText: 'Licence conditions for Test Person sent',
          backLink: '/licence/view/cases',
        })
      })
    })
  })
})
