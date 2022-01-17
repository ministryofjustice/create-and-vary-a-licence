import { Request, Response } from 'express'

import CaseloadRoutes from './caseload'
import CaseloadService from '../../../services/caseloadService'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import statusConfig from '../../../licences/licenceStatus'
import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceType from '../../../enumeration/licenceType'

const caseloadService = new CaseloadService(null, null, null) as jest.Mocked<CaseloadService>

jest.mock('../../../services/caseloadService')

describe('Route Handlers - Vary Licence - Caseload', () => {
  const handler = new CaseloadRoutes(caseloadService)
  let req: Request
  let res: Response

  beforeEach(() => {
    caseloadService.getVaryCaseload.mockResolvedValue([
      {
        licenceId: 1,
        forename: 'Joe',
        surname: 'Rogan',
        crn: 'X381306',
        licenceType: LicenceType.AP_PSS,
        actualReleaseDate: '23/03/2021',
        licenceStatus: LicenceStatus.ACTIVE,
      },
    ] as LicenceSummary[])
  })

  describe('GET', () => {
    beforeEach(() => {
      req = {} as Request

      res = {
        render: jest.fn(),
        locals: {
          user: {
            username: 'USER1',
            deliusStaffIdentifier: 2000,
          },
        },
      } as unknown as Response
    })

    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/caseload', {
        caseload: [
          {
            licenceId: 1,
            name: 'Joe Rogan',
            crnNumber: 'X381306',
            releaseDate: '23rd March 2021',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP_PSS,
          },
        ],
        statusConfig,
      })
      expect(caseloadService.getVaryCaseload).toHaveBeenCalledWith(res.locals.user)
    })
  })
})
