import { Request, Response } from 'express'

import ViewAndPrintLicenceRoutes from './viewLicence'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
const username = 'joebloggs'

describe('Route - view and approve a licence', () => {
  const handler = new ViewAndPrintLicenceRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      body: {
        licenceId: '1',
      },
    } as unknown as Request
  })

  describe('GET', () => {
    it('should render a single licence view for printing', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            id: 1,
            statusCode: LicenceStatus.ACTIVE,
            surname: 'Bobson',
            forename: 'Bob',
            appointmentTime: '12/12/2022 14:16',
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/view')
    })

    it('should check status is ACTIVE or APPROVED else redirect to case list', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            id: 1,
            statusCode: LicenceStatus.SUBMITTED,
            surname: 'Bobson',
            forename: 'Bob',
            appointmentTime: '12/12/2022 14:16',
          },
        },
      } as unknown as Response

      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/view/cases')
    })
  })

  describe('POST', () => {
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: { user: { username } },
    } as unknown as Response

    it('should print a licence', async () => {
      req = {
        body: { licenceId: '1', result: 'print' },
      } as unknown as Request

      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/view/cases')
    })
  })
})
