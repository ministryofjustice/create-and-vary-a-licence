import { Request, Response } from 'express'

import CaseloadRoutes from './caseload'
import LicenceService from '../../../services/licenceService'
import CaseloadService from '../../../services/caseloadService'
import statusConfig from '../../../licences/licenceStatus'
import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceType from '../../../enumeration/licenceType'
import { ManagedCase } from '../../../@types/managedCase'

const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>
const caseloadService = new CaseloadService(null, null, null) as jest.Mocked<CaseloadService>

jest.mock('../../../services/licenceService')
jest.mock('../../../services/caseloadService')

describe('Route Handlers - Create Licence - Caseload', () => {
  const handler = new CaseloadRoutes(licenceService, caseloadService)
  let req: Request
  let res: Response

  beforeEach(() => {
    caseloadService.getStaffCreateCaseload.mockResolvedValue([
      {
        deliusRecord: {
          offenderCrn: 'X381306',
        },
        nomisRecord: {
          firstName: 'John',
          lastName: 'Roberts',
          conditionalReleaseDate: '2022-10-12',
          prisonerNumber: '123',
          prisonId: 'MDI',
        },
        licences: [
          {
            id: 1,
            type: LicenceType.AP,
            status: LicenceStatus.IN_PROGRESS,
          },
        ],
        probationPractitioner: {
          name: 'Joe Bloggs',
          staffIdentifier: 2000,
        },
      },
    ] as unknown as ManagedCase[])

    caseloadService.getTeamCreateCaseload.mockResolvedValue([
      {
        deliusRecord: {
          offenderCrn: 'X381306',
        },
        nomisRecord: {
          firstName: 'John',
          lastName: 'Roberts',
          conditionalReleaseDate: '2022-10-12',
          prisonerNumber: '123',
          prisonId: 'MDI',
        },
        licences: [
          {
            id: 1,
            type: LicenceType.AP,
            status: LicenceStatus.IN_PROGRESS,
          },
        ],
        probationPractitioner: {
          name: 'Sherlock Holmes',
          staffIdentifier: 3000,
        },
      },
      {
        deliusRecord: {
          offenderCrn: 'X381307',
        },
        nomisRecord: {
          firstName: 'Dr',
          lastName: 'Who',
          conditionalReleaseDate: '2023-10-12',
          prisonerNumber: '124',
          prisonId: 'LEI',
        },
        licences: [
          {
            id: 2,
            type: LicenceType.AP_PSS,
            status: LicenceStatus.IN_PROGRESS,
          },
        ],
      },
      {
        deliusRecord: {
          offenderCrn: 'X381308',
        },
        nomisRecord: {
          firstName: 'Mabel',
          lastName: 'Moorhouse',
          conditionalReleaseDate: '2023-10-12',
          prisonerNumber: '125',
          prisonId: 'LEI',
        },
        licences: [
          {
            type: LicenceType.AP_PSS,
            status: LicenceStatus.NOT_IN_PILOT,
          },
        ],
      },
      {
        deliusRecord: {
          offenderCrn: 'X381309',
        },
        nomisRecord: {
          firstName: 'Ronald',
          lastName: 'Recall',
          conditionalReleaseDate: '2023-10-12',
          prisonerNumber: '126',
          prisonId: 'LEI',
        },
        licences: [
          {
            type: LicenceType.AP_PSS,
            status: LicenceStatus.OOS_RECALL,
          },
        ],
      },
    ] as unknown as ManagedCase[])
  })

  afterEach(() => {
    jest.resetAllMocks()
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
          },
        },
      } as unknown as Response
    })

    it('should render view with My Cases tab selected', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
        caseload: [
          {
            name: 'John Roberts',
            crnNumber: 'X381306',
            releaseDate: '12 Oct 2022',
            prisonerNumber: '123',
            licenceId: 1,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Joe Bloggs',
              staffIdentifier: 2000,
            },
            isClickable: true,
          },
        ],
        statusConfig,
        teamView: false,
      })
      expect(caseloadService.getStaffCreateCaseload).toHaveBeenCalledWith(res.locals.user)
      expect(caseloadService.getTeamCreateCaseload).not.toHaveBeenCalled()
    })

    it('should render view with Team Cases tab selected', async () => {
      req.query = { view: 'team' }

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
        caseload: [
          {
            name: 'John Roberts',
            crnNumber: 'X381306',
            releaseDate: '12 Oct 2022',
            prisonerNumber: '123',
            licenceId: 1,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Sherlock Holmes',
              staffIdentifier: 3000,
            },
            isClickable: true,
          },
          {
            name: 'Dr Who',
            crnNumber: 'X381307',
            releaseDate: '12 Oct 2023',
            prisonerNumber: '124',
            licenceId: 2,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            licenceType: LicenceType.AP_PSS,
            isClickable: false,
          },
          {
            name: 'Mabel Moorhouse',
            crnNumber: 'X381308',
            releaseDate: '12 Oct 2023',
            prisonerNumber: '125',
            licenceStatus: LicenceStatus.NOT_IN_PILOT,
            licenceType: LicenceType.AP_PSS,
            isClickable: false,
          },
          {
            name: 'Ronald Recall',
            crnNumber: 'X381309',
            releaseDate: '12 Oct 2023',
            prisonerNumber: '126',
            licenceStatus: LicenceStatus.OOS_RECALL,
            licenceType: LicenceType.AP_PSS,
            isClickable: false,
          },
        ],
        statusConfig,
        teamView: true,
      })
      expect(caseloadService.getTeamCreateCaseload).toHaveBeenCalledWith(res.locals.user)
      expect(caseloadService.getStaffCreateCaseload).not.toHaveBeenCalled()
    })

    it('should successfully search by CRN', async () => {
      req.query = { view: 'team', search: 'x381307' }

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
        caseload: [
          {
            name: 'Dr Who',
            crnNumber: 'X381307',
            releaseDate: '12 Oct 2023',
            prisonerNumber: '124',
            licenceId: 2,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            licenceType: LicenceType.AP_PSS,
            isClickable: false,
          },
        ],
        statusConfig,
        teamView: true,
        search: 'x381307',
      })
      expect(caseloadService.getTeamCreateCaseload).toHaveBeenCalledWith(res.locals.user)
      expect(caseloadService.getStaffCreateCaseload).not.toHaveBeenCalled()
    })

    it('should successfully search by CRN for an un-clickable recall case', async () => {
      req.query = { view: 'team', search: 'x381309' }

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
        caseload: [
          {
            name: 'Ronald Recall',
            crnNumber: 'X381309',
            releaseDate: '12 Oct 2023',
            prisonerNumber: '126',
            licenceStatus: LicenceStatus.OOS_RECALL,
            licenceType: LicenceType.AP_PSS,
            isClickable: false,
          },
        ],
        statusConfig,
        teamView: true,
        search: 'x381309',
      })
      expect(caseloadService.getTeamCreateCaseload).toHaveBeenCalledWith(res.locals.user)
      expect(caseloadService.getStaffCreateCaseload).not.toHaveBeenCalled()
    })

    it('should successfully search by probation practitioner', async () => {
      req.query = { view: 'team', search: 'holmes' }

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
        caseload: [
          {
            name: 'John Roberts',
            crnNumber: 'X381306',
            releaseDate: '12 Oct 2022',
            prisonerNumber: '123',
            licenceId: 1,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Sherlock Holmes',
              staffIdentifier: 3000,
            },
            isClickable: true,
          },
        ],
        statusConfig,
        teamView: true,
        search: 'holmes',
      })
      expect(caseloadService.getTeamCreateCaseload).toHaveBeenCalledWith(res.locals.user)
      expect(caseloadService.getStaffCreateCaseload).not.toHaveBeenCalled()
    })

    it('should successfully search by offender name', async () => {
      req.query = { view: 'team', search: 'roberts' }

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
        caseload: [
          {
            name: 'John Roberts',
            crnNumber: 'X381306',
            releaseDate: '12 Oct 2022',
            prisonerNumber: '123',
            licenceId: 1,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Sherlock Holmes',
              staffIdentifier: 3000,
            },
            isClickable: true,
          },
        ],
        statusConfig,
        teamView: true,
        search: 'roberts',
      })
      expect(caseloadService.getTeamCreateCaseload).toHaveBeenCalledWith(res.locals.user)
      expect(caseloadService.getStaffCreateCaseload).not.toHaveBeenCalled()
    })
  })
})
