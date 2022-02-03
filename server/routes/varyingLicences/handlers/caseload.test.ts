import { Request, Response } from 'express'

import CaseloadRoutes from './caseload'
import CaseloadService from '../../../services/caseloadService'
import statusConfig from '../../../licences/licenceStatus'
import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceType from '../../../enumeration/licenceType'
import { LicenceAndResponsibleCom } from '../../../@types/managedCase'

const caseloadService = new CaseloadService(null, null, null) as jest.Mocked<CaseloadService>

jest.mock('../../../services/caseloadService')

describe('Route Handlers - Vary Licence - Caseload', () => {
  const handler = new CaseloadRoutes(caseloadService)
  let req: Request
  let res: Response

  beforeEach(() => {
    caseloadService.getStaffVaryCaseload.mockResolvedValue([
      {
        licenceId: 1,
        forename: 'Joe',
        surname: 'Rogan',
        crn: 'X381306',
        licenceType: LicenceType.AP_PSS,
        actualReleaseDate: '23/03/2021',
        licenceStatus: LicenceStatus.ACTIVE,
        comFirstName: 'Stephen',
        comLastName: 'Hawking',
      },
    ] as LicenceAndResponsibleCom[])

    caseloadService.getTeamVaryCaseload.mockResolvedValue([
      {
        licenceId: 1,
        crn: 'X381306',
        forename: 'Joe',
        surname: 'Rogan',
        actualReleaseDate: '23/03/2021',
        licenceStatus: LicenceStatus.ACTIVE,
        licenceType: LicenceType.AP,
        comFirstName: 'Stephen',
        comLastName: 'Hawking',
      },
      {
        licenceId: 2,
        crn: 'X381307',
        forename: 'Dr',
        surname: 'Who',
        actualReleaseDate: '23/03/2021',
        licenceStatus: LicenceStatus.ACTIVE,
        licenceType: LicenceType.AP_PSS,
        comFirstName: 'Sherlock',
        comLastName: 'Holmes',
      },
    ] as LicenceAndResponsibleCom[])
  })

  describe('GET', () => {
    beforeEach(() => {
      req = {
        query: {},
      } as Request

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

    it('should render view with My Cases tab selected', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/caseload', {
        caseload: [
          {
            licenceId: 1,
            name: 'Joe Rogan',
            crnNumber: 'X381306',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP_PSS,
            probationPractitioner: 'Stephen Hawking',
            releaseDate: '23 Mar 2021',
          },
        ],
        statusConfig,
        teamView: false,
      })
      expect(caseloadService.getStaffVaryCaseload).toHaveBeenCalledWith(res.locals.user)
    })

    it('should render view with Team Cases tab selected', async () => {
      req.query.view = 'team'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/caseload', {
        caseload: [
          {
            licenceId: 1,
            name: 'Joe Rogan',
            crnNumber: 'X381306',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: 'Stephen Hawking',
            releaseDate: '23 Mar 2021',
          },
          {
            licenceId: 2,
            name: 'Dr Who',
            crnNumber: 'X381307',
            licenceStatus: 'ACTIVE',
            licenceType: 'AP_PSS',
            probationPractitioner: 'Sherlock Holmes',
            releaseDate: '23 Mar 2021',
          },
        ],
        statusConfig,
        teamView: true,
      })
      expect(caseloadService.getTeamVaryCaseload).toHaveBeenCalledWith(res.locals.user)
    })

    it('should successfully search by name', async () => {
      req.query.view = 'team'
      req.query.search = 'rogan'

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/caseload', {
        caseload: [
          {
            licenceId: 1,
            name: 'Joe Rogan',
            crnNumber: 'X381306',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: 'Stephen Hawking',
            releaseDate: '23 Mar 2021',
          },
        ],
        statusConfig,
        teamView: true,
        search: 'rogan',
      })
      expect(caseloadService.getTeamVaryCaseload).toHaveBeenCalledWith(res.locals.user)
    })

    it('should successfully search by probation practitioner', async () => {
      req.query.view = 'team'
      req.query.search = 'hawking'

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/caseload', {
        caseload: [
          {
            licenceId: 1,
            name: 'Joe Rogan',
            crnNumber: 'X381306',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: 'Stephen Hawking',
            releaseDate: '23 Mar 2021',
          },
        ],
        statusConfig,
        teamView: true,
        search: 'hawking',
      })
      expect(caseloadService.getTeamVaryCaseload).toHaveBeenCalledWith(res.locals.user)
    })

    it('should successfully search by crn', async () => {
      req.query.view = 'team'
      req.query.search = 'x381306'

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/caseload', {
        caseload: [
          {
            licenceId: 1,
            name: 'Joe Rogan',
            crnNumber: 'X381306',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: 'Stephen Hawking',
            releaseDate: '23 Mar 2021',
          },
        ],
        statusConfig,
        teamView: true,
        search: 'x381306',
      })
      expect(caseloadService.getTeamVaryCaseload).toHaveBeenCalledWith(res.locals.user)
    })
  })
})
