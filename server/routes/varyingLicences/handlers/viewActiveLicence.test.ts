import { Request, Response } from 'express'

import ViewActiveLicenceRoutes from './viewActiveLicence'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'

const username = 'joebloggs'

describe('Route - Vary - View active licence', () => {
  const handler = new ViewActiveLicenceRoutes()
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
    it('should render a licence view for printing and varying', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence,
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/vary/viewActive', {
        expandedLicenceConditions: res.locals.licence.additionalLicenceConditions,
        expandedPssConditions: res.locals.licence.additionalPssConditions,
      })
    })
  })
})
