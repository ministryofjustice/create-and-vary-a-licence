import { Request, Response } from 'express'

import CaseloadRoutes from './caseload'
import LicenceService from '../../../services/licenceService'
import CaseloadService from '../../../services/caseloadService'
import { ManagedCase } from '../../../@types/managedCase'

const licenceService = new LicenceService(null) as jest.Mocked<LicenceService>
const caseloadService = new CaseloadService(null, null) as jest.Mocked<CaseloadService>

jest.mock('../../../services/licenceService')
jest.mock('../../../services/caseloadService')

describe('Route Handlers - Create Licence - Caseload', () => {
  const handler = new CaseloadRoutes(licenceService, caseloadService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {} as Request

    res = {
      render: jest.fn(),
      locals: {
        user: {
          username: 'USER1',
        },
      },
    } as unknown as Response

    caseloadService.getStaffCaseload.mockResolvedValue([
      {
        crnNumber: 'X381306',
        firstName: 'Joe',
        lastName: 'Rogan',
        conditionalReleaseDate: '09/09/2022',
      },
    ] as unknown as ManagedCase[])
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
        caseload: [
          {
            name: 'Joe Rogan',
            crnNumber: 'X381306',
            conditionalReleaseDate: '09/09/2022',
          },
          {
            name: 'Adam Balasaravika',
            crnNumber: 'X344165',
            conditionalReleaseDate: '03 August 2022',
          },
        ],
      })
      expect(caseloadService.getStaffCaseload).toHaveBeenCalledWith('USER1')
    })
  })
})
