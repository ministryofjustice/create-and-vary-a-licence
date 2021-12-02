import { Request, Response } from 'express'

import ViewAndPrintLicenceRoutes from './viewLicence'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'

const username = 'joebloggs'

describe('Route - view and approve a licence', () => {
  const handler = new ViewAndPrintLicenceRoutes()
  let req: Request
  let res: Response

  const licence = {
    id: 1,
    statusCode: LicenceStatus.ACTIVE,
    surname: 'Bobson',
    forename: 'Bob',
    appointmentTime: '12/12/2022 14:16',
    additionalLicenceConditions: [],
    additionalPssConditions: [],
    bespokeConditions: [],
  } as Licence

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
          licence,
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/view', {
        expandedLicenceConditions: res.locals.licence.additionalLicenceConditions,
        expandedPssConditions: res.locals.licence.additionalPssConditions,
      })
    })

    it('should render a single licence view for printing when APPROVED', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: { ...licence, statusCode: LicenceStatus.APPROVED },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/view', {
        expandedLicenceConditions: res.locals.licence.additionalLicenceConditions,
        expandedPssConditions: res.locals.licence.additionalPssConditions,
      })
    })

    it('should not render view when status is IN_PROGRESS', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: { ...licence, statusCode: LicenceStatus.IN_PROGRESS },
        },
      } as unknown as Response

      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/view/cases')
    })
  })
})
