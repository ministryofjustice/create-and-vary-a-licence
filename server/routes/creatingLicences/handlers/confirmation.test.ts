import { Request, Response } from 'express'

import ConfirmationRoutes from './confirmation'

describe('Route Handlers - Confirmation', () => {
  const handler = new ConfirmationRoutes()
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
      session: {
        returnToCase: 'some-back-link',
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      locals: {
        licence: {
          forename: 'Bobby',
          surname: 'Zamora',
          prisonDescription: `Leeds (HMP)`,
        },
      },
    } as unknown as Response
  })

  describe('Create CRD Licence', () => {
    describe('GET', () => {
      it('should render view for AP_PSS licence type', async () => {
        res.locals.licence.typeCode = 'AP_PSS'

        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/create/confirmation', {
          confirmationMessage:
            'We have sent the licence and post sentence supervision order to Leeds (HMP) for approval.',
          titleText: 'Licence and post sentence supervision order for Bobby Zamora sent',
          backLink: req.session.returnToCase,
        })
      })

      it('should render default return to caseload link if no session state', async () => {
        const reqWithEmptySession = {
          params: {
            licenceId: '1',
          },
          session: {},
          flash: jest.fn(),
        } as unknown as Request

        res.locals.licence.typeCode = 'AP_PSS'

        await handler.GET(reqWithEmptySession, res)
        expect(res.render).toHaveBeenCalledWith('pages/create/confirmation', {
          confirmationMessage:
            'We have sent the licence and post sentence supervision order to Leeds (HMP) for approval.',
          titleText: 'Licence and post sentence supervision order for Bobby Zamora sent',
          backLink: '/licence/create/caseload',
        })
      })

      it('should render view for AP licence type', async () => {
        res.locals.licence.typeCode = 'AP'

        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/create/confirmation', {
          confirmationMessage: 'We have sent the licence to Leeds (HMP) for approval.',
          titleText: 'Licence conditions for Bobby Zamora sent',
          backLink: req.session.returnToCase,
        })
      })

      it('should render view for PSS licence type', async () => {
        res.locals.licence.typeCode = 'PSS'

        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/create/confirmation', {
          confirmationMessage: 'We have sent the post sentence supervision order to Leeds (HMP) for approval.',
          titleText: 'Post sentence supervision order for Bobby Zamora sent',
          backLink: req.session.returnToCase,
        })
      })
    })
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
        expect(res.render).toHaveBeenCalledWith('pages/create/confirmation', {
          confirmationMessage: 'We have sent the licence to Leeds (HMP) for approval.',
          titleText: 'Licence conditions for Bobby Zamora sent',
          backLink: '/licence/view/cases',
        })
      })
    })
  })
})
