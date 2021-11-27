import { Request, Response } from 'express'

import ViewAndPrintLicenceRoutes from './viewLicence'
import LicenceStatus from '../../../enumeration/licenceStatus'

const username = 'joebloggs'

describe('Route - view and approve a licence', () => {
  const handler = new ViewAndPrintLicenceRoutes()
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
    it('should render a single licence view for printing when ACTIVE', async () => {
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

    it('should render a single licence view for printing when APPROVED', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            id: 1,
            statusCode: LicenceStatus.APPROVED,
            surname: 'Bobson',
            forename: 'Bob',
            appointmentTime: '12/12/2022 14:16',
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/view')
    })

    it('should not render view when status is IN_PROGRESS', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            id: 1,
            statusCode: LicenceStatus.IN_PROGRESS,
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
})
