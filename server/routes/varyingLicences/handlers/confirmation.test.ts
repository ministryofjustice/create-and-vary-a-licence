import { Request, Response } from 'express'

import ConfirmationRoutes from './confirmation'
import LicenceService from '../../../services/licenceService'
import { Licence } from '../../../@types/licenceApiClientTypes'
import LicenceKind from '../../../enumeration/LicenceKind'

jest.mock('../../../services/licenceService')

describe('Route Handlers - Vary Licence - Confirmation', () => {
  const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
  const handler = new ConfirmationRoutes(licenceService)
  let req: Request
  let res: Response

  const licence = {
    nomsId: 'A1234BC',
    kind: LicenceKind.CRD,
    id: 1,
    statusCode: 'ACTIVE',
    version: '3.0',
  } as Licence

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
      session: {
        returnToCase: '/licence/vary/caseload',
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      locals: {
        licence: {
          forename: 'Joe',
          surname: 'Bloggs',
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    describe('licence variations', () => {
      beforeEach(() => {
        licenceService.getLicence.mockResolvedValue(licence)
      })
      it('should render view for AP_PSS licence type', async () => {
        res.locals.licence.typeCode = 'AP_PSS'

        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/vary/confirmation', {
          licenceType: 'licence and post sentence supervision order',
          titleText: 'Licence conditions variation for Joe Bloggs sent',
          backLink: req.session.returnToCase,
          isTimeServedVariation: false,
        })
      })

      it('should render default backlink if no session state', async () => {
        const reqWithEmptySession = {
          params: {
            licenceId: '1',
          },
          body: { answer: 'Yes' },
          session: {},
          flash: jest.fn(),
        } as unknown as Request

        res.locals.licence.typeCode = 'AP_PSS'

        await handler.GET(reqWithEmptySession, res)
        expect(res.render).toHaveBeenCalledWith('pages/vary/confirmation', {
          licenceType: 'licence and post sentence supervision order',
          titleText: 'Licence conditions variation for Joe Bloggs sent',
          backLink: '/licence/vary/caseload',
          isTimeServedVariation: false,
        })
      })

      it('should render view for AP licence type', async () => {
        res.locals.licence.typeCode = 'AP'

        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/vary/confirmation', {
          licenceType: 'licence',
          titleText: 'Licence variation for Joe Bloggs sent',
          backLink: req.session.returnToCase,
          isTimeServedVariation: false,
        })
      })

      it('should render view for PSS licence type', async () => {
        res.locals.licence.typeCode = 'PSS'

        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/vary/confirmation', {
          licenceType: 'post sentence supervision order',
          titleText: 'Post sentence supervision order variation for Joe Bloggs sent',
          backLink: req.session.returnToCase,
          isTimeServedVariation: false,
        })
      })
    })

    describe('time served licence variations', () => {
      beforeEach(() => {
        licenceService.getLicence.mockResolvedValue({ ...licence, kind: LicenceKind.TIME_SERVED } as Licence)
      })

      it('should render view for time served licence variation', async () => {
        res.locals.licence.typeCode = 'AP_PSS'

        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/vary/confirmation', {
          licenceType: 'licence and post sentence supervision order',
          titleText: 'Licence conditions variation for Joe Bloggs sent',
          backLink: req.session.returnToCase,
          isTimeServedVariation: true,
        })
      })
    })
  })
})
