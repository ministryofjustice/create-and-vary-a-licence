import { Request, Response } from 'express'

import { subDays } from 'date-fns'
import CaseloadRoutes from './caseload'
import statusConfig from '../../../licences/licenceStatus'
import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceType from '../../../enumeration/licenceType'
import { ManagedCase } from '../../../@types/managedCase'
import { parseIsoDate } from '../../../utils/utils'
import LicenceKind from '../../../enumeration/LicenceKind'
import ComCaseloadService from '../../../services/lists/comCaseloadService'

const comCaseloadService = new ComCaseloadService(null, null, null) as jest.Mocked<ComCaseloadService>

jest.mock('../../../services/lists/comCaseloadService')

describe('Route Handlers - Create Licence - Caseload', () => {
  const handler = new CaseloadRoutes(comCaseloadService)
  let req: Request
  let res: Response

  beforeEach(() => {
    comCaseloadService.getStaffCreateCaseload.mockResolvedValue([
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
            hardStopDate: subDays(parseIsoDate('2022-10-12'), 2),
            hardStopWarningDate: subDays(parseIsoDate('2022-10-12'), 4),
            kind: LicenceKind.CRD,
          },
        ],
        probationPractitioner: {
          name: 'Joe Bloggs',
          staffIdentifier: 2000,
        },
        cvlFields: {},
      },
    ] as unknown as ManagedCase[])

    comCaseloadService.getTeamCreateCaseload.mockResolvedValue([
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
            hardStopDate: subDays(parseIsoDate('2022-10-12'), 2),
            hardStopWarningDate: subDays(parseIsoDate('2022-10-12'), 4),
            kind: LicenceKind.CRD,
          },
        ],
        probationPractitioner: {
          name: 'Sherlock Holmes',
          staffIdentifier: 3000,
        },
        cvlFields: {},
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
            hardStopDate: subDays(parseIsoDate('2022-10-12'), 2),
            hardStopWarningDate: subDays(parseIsoDate('2022-10-12'), 4),
            kind: LicenceKind.CRD,
          },
        ],
        cvlFields: {},
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
            hardStopDate: subDays(parseIsoDate('2022-10-12'), 2),
            hardStopWarningDate: subDays(parseIsoDate('2022-10-12'), 4),
            kind: LicenceKind.CRD,
          },
        ],
        cvlFields: {},
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
            hardStopDate: subDays(parseIsoDate('2022-10-12'), 2),
            hardStopWarningDate: subDays(parseIsoDate('2022-10-12'), 4),
            kind: LicenceKind.CRD,
          },
        ],
        cvlFields: {},
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
        session: {
          teamSelection: ['teamA'],
        },
      } as Request

      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: {
            username: 'USER1',
            probationTeamCodes: ['teamA', 'teamB'],
            probationTeams: [
              {
                code: 'teamA',
                label: 'teamA',
              },
              {
                code: 'teamB',
                label: 'teamB',
              },
            ],
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
            hardStopDate: '10/10/2022',
            hardStopWarningDate: '08/10/2022',
            kind: 'CRD',
            prisonerNumber: '123',
            licenceId: 1,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Joe Bloggs',
              staffIdentifier: 2000,
            },
            isClickable: true,
            createLink: '/licence/create/id/1/check-your-answers',
            sortDate: parseIsoDate('2022-10-12'),
          },
        ],
        multipleTeams: false,
        statusConfig,
        teamView: false,
        teamName: null,
      })
      expect(comCaseloadService.getStaffCreateCaseload).toHaveBeenCalledWith(res.locals.user)
      expect(comCaseloadService.getTeamCreateCaseload).not.toHaveBeenCalled()
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
            hardStopDate: '10/10/2022',
            hardStopWarningDate: '08/10/2022',
            kind: 'CRD',
            prisonerNumber: '123',
            licenceId: 1,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Sherlock Holmes',
              staffIdentifier: 3000,
            },
            isClickable: true,
            createLink: '/licence/create/id/1/check-your-answers',
            sortDate: parseIsoDate('2022-10-12'),
          },
          {
            name: 'Dr Who',
            crnNumber: 'X381307',
            releaseDate: '12 Oct 2023',
            hardStopDate: '10/10/2022',
            hardStopWarningDate: '08/10/2022',
            kind: 'CRD',
            prisonerNumber: '124',
            probationPractitioner: undefined,
            licenceId: 2,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            licenceType: LicenceType.AP_PSS,
            isClickable: false,
            createLink: '/licence/create/id/2/check-your-answers',
            sortDate: parseIsoDate('2023-10-12'),
          },
          {
            name: 'Mabel Moorhouse',
            crnNumber: 'X381308',
            releaseDate: '12 Oct 2023',
            hardStopDate: '10/10/2022',
            hardStopWarningDate: '08/10/2022',
            kind: 'CRD',
            licenceId: undefined,
            prisonerNumber: '125',
            probationPractitioner: undefined,
            licenceStatus: LicenceStatus.NOT_IN_PILOT,
            licenceType: LicenceType.AP_PSS,
            isClickable: false,
            createLink: '/licence/create/nomisId/125/confirm',
            sortDate: parseIsoDate('2023-10-12'),
          },
          {
            name: 'Ronald Recall',
            crnNumber: 'X381309',
            releaseDate: '12 Oct 2023',
            hardStopDate: '10/10/2022',
            hardStopWarningDate: '08/10/2022',
            kind: 'CRD',
            licenceId: undefined,
            prisonerNumber: '126',
            probationPractitioner: undefined,
            licenceStatus: LicenceStatus.OOS_RECALL,
            licenceType: LicenceType.AP_PSS,
            isClickable: false,
            createLink: '/licence/create/nomisId/126/confirm',
            sortDate: parseIsoDate('2023-10-12'),
          },
        ],
        statusConfig,
        multipleTeams: true,
        teamName: 'teamA',
        teamView: true,
      })
      expect(comCaseloadService.getTeamCreateCaseload).toHaveBeenCalledWith(res.locals.user, ['teamA'])
      expect(comCaseloadService.getStaffCreateCaseload).not.toHaveBeenCalled()
    })

    it('should redirect to change team page when user has multiple teams and no active team selected', async () => {
      req.query = { view: 'team' }
      req.session.teamSelection = null
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('caseload/change-team')
    })

    it('should use default team if user has only one assigned', async () => {
      req.query = { view: 'team' }
      req.session.teamSelection = null
      res.locals.user.probationTeams = [{ code: 'ABC', label: 'Team A' }]
      res.locals.user.probationTeamCodes = ['ABC']

      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledTimes(0)
    })

    it('should render the non-approved licence if 2 exist', async () => {
      comCaseloadService.getStaffCreateCaseload.mockResolvedValue([
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
              status: LicenceStatus.APPROVED,
              hardStopDate: subDays(parseIsoDate('2022-10-12'), 2),
              hardStopWarningDate: subDays(parseIsoDate('2022-10-12'), 4),
              kind: LicenceKind.CRD,
            },
            {
              id: 2,
              type: LicenceType.AP,
              status: LicenceStatus.IN_PROGRESS,
              hardStopDate: subDays(parseIsoDate('2022-10-12'), 2),
              hardStopWarningDate: subDays(parseIsoDate('2022-10-12'), 4),
              kind: LicenceKind.CRD,
            },
          ],
          probationPractitioner: {
            name: 'Joe Bloggs',
          },
          cvlFields: {},
        },
      ] as unknown as ManagedCase[])

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
        caseload: [
          {
            licenceId: 2,
            name: 'John Roberts',
            crnNumber: 'X381306',
            prisonerNumber: '123',
            releaseDate: '12 Oct 2022',
            hardStopWarningDate: '08/10/2022',
            kind: LicenceKind.CRD,
            hardStopDate: '10/10/2022',
            licenceStatus: LicenceStatus.IN_PROGRESS,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Joe Bloggs',
            },
            isClickable: true,
            createLink: '/licence/create/id/2/check-your-answers',
            sortDate: parseIsoDate('2022-10-12'),
          },
        ],
        multipleTeams: false,
        statusConfig,
        teamName: null,
        teamView: false,
      })
      expect(comCaseloadService.getStaffCreateCaseload).toHaveBeenCalledWith(res.locals.user)
    })
  })
})
