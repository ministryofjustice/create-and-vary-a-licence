import { Request, Response } from 'express'

import CaseloadRoutes from './caseload'
import LicenceService from '../../../services/licenceService'
import CaseloadService from '../../../services/caseloadService'
import { CaseTypeAndStatus } from '../../../@types/managedCase'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import statusConfig from '../../../licences/licenceStatus'
import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceType from '../../../enumeration/licenceType'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
const caseloadService = new CaseloadService(null, null, null) as jest.Mocked<CaseloadService>

jest.mock('../../../services/licenceService')
jest.mock('../../../services/caseloadService')

describe('Route Handlers - Create Licence - Caseload', () => {
  const handler = new CaseloadRoutes(licenceService, caseloadService)
  let req: Request
  let res: Response

  beforeEach(() => {
    caseloadService.getStaffCaseload.mockResolvedValue([
      {
        crnNumber: 'X381306',
        firstName: 'Joe',
        lastName: 'Rogan',
        conditionalReleaseDate: '2022-10-12',
        prisonerNumber: '123',
        licenceStatus: LicenceStatus.IN_PROGRESS,
        licenceType: LicenceType.AP,
      },
    ] as unknown as CaseTypeAndStatus[])
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
      expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
        caseload: [
          {
            name: 'Joe Rogan',
            crnNumber: 'X381306',
            conditionalReleaseDate: '12th October 2022',
            prisonerNumber: '123',
            licenceStatus: LicenceStatus.IN_PROGRESS,
            licenceType: LicenceType.AP,
          },
        ],
        statusConfig,
      })
      expect(caseloadService.getStaffCaseload).toHaveBeenCalledWith(res.locals.user)
    })
  })

  describe('POST', () => {
    beforeEach(() => {
      req = {
        body: {
          prisonerNumber: '123',
        },
      } as Request

      res = {
        redirect: jest.fn(),
        locals: {
          user: {
            username: 'USER1',
          },
        },
      } as unknown as Response
      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([])
    })

    it('should redirect to check your answers page if the selected person already has a licence', async () => {
      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
        { licenceId: 1 },
        { licenceId: 2 },
      ] as LicenceSummary[])

      await handler.POST(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
      expect(licenceService.createLicence).not.toBeCalled()
      expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(['123'], [], res.locals.user)
    })

    it('should create a licence and redirect to the initial meeting screen', async () => {
      licenceService.createLicence.mockResolvedValue({ licenceId: 1 } as LicenceSummary)

      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/initial-meeting-name')
      expect(licenceService.createLicence).toHaveBeenCalledWith('123', res.locals.user)
    })
  })
})
